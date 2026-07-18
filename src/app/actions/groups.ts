"use server";

import { db } from "@/db";
import { groups, groupMembers, messages } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./auth";
import type { GroupWithMembers, MessageWithUser } from "@/lib/definitions";

export async function createGroup(
  prevState: { message?: string; errors?: Record<string, string[]> } | undefined,
  formData: FormData
) {
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;

  if (!name || name.length < 2) {
    return { errors: { name: ["Group name must be at least 2 characters."] } };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { message: "You must be logged in." };
  }

  const [group] = await db
    .insert(groups)
    .values({
      name,
      description,
      createdBy: currentUser.id,
    })
    .returning();

  await db.insert(groupMembers).values({
    groupId: group.id,
    userId: currentUser.id,
    role: "admin",
  });

  revalidatePath("/chat");
  redirect(`/chat/${group.id}`);
}

import { redirect } from "next/navigation";

export async function getGroups(): Promise<GroupWithMembers[]> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return [];

  const memberGroups = await db.query.groupMembers.findMany({
    where: eq(groupMembers.userId, currentUser.id),
    with: {
      group: true,
    },
  });

  const groupIds = memberGroups.map((mg) => mg.groupId);

  if (groupIds.length === 0) return [];

  const result: GroupWithMembers[] = [];

  for (const group of memberGroups) {
    const members = await db.query.groupMembers.findMany({
      where: eq(groupMembers.groupId, group.groupId),
      with: {
        user: true,
      },
    });

    const lastMessage = await db.query.messages.findFirst({
      where: eq(messages.groupId, group.groupId),
      orderBy: [desc(messages.createdAt)],
      with: {
        user: true,
      },
    });

    result.push({
      ...group.group,
      members,
      lastMessage: lastMessage
        ? { ...lastMessage, user: lastMessage.user }
        : null,
    });
  }

  result.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt?.getTime() ?? a.createdAt.getTime();
    const bTime = b.lastMessage?.createdAt?.getTime() ?? b.createdAt.getTime();
    return bTime - aTime;
  });

  return result;
}

export async function getGroupById(
  groupId: string
): Promise<GroupWithMembers | null> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  const group = await db.query.groups.findFirst({
    where: eq(groups.id, groupId),
  });

  if (!group) return null;

  const memberCheck = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.userId, currentUser.id)
    ),
  });

  if (!memberCheck) return null;

  const members = await db.query.groupMembers.findMany({
    where: eq(groupMembers.groupId, groupId),
    with: {
      user: true,
    },
  });

  return {
    ...group,
    members,
  };
}

export async function getMessages(
  groupId: string,
  limit = 50
): Promise<MessageWithUser[]> {
  const msgs = await db.query.messages.findMany({
    where: eq(messages.groupId, groupId),
    orderBy: [desc(messages.createdAt)],
    limit,
    with: {
      user: true,
    },
  });

  return msgs.reverse().map((m) => ({
    ...m,
    user: m.user,
  }));
}

export async function sendMessage(
  groupId: string,
  content: string
): Promise<{ error?: string }> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "You must be logged in." };
  }

  const memberCheck = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.userId, currentUser.id)
    ),
  });

  if (!memberCheck) {
    return { error: "You are not a member of this group." };
  }

  await db.insert(messages).values({
    groupId,
    userId: currentUser.id,
    content,
  });

  revalidatePath(`/chat/${groupId}`);
  return {};
}

export async function joinGroup(
  groupId: string
): Promise<{ error?: string }> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "You must be logged in." };
  }

  const existing = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.userId, currentUser.id)
    ),
  });

  if (existing) {
    return { error: "You are already a member." };
  }

  await db.insert(groupMembers).values({
    groupId,
    userId: currentUser.id,
    role: "member",
  });

  revalidatePath("/chat");
  revalidatePath(`/chat/${groupId}`);
  return {};
}

export async function leaveGroup(
  groupId: string
): Promise<{ error?: string }> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "You must be logged in." };
  }

  const member = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.userId, currentUser.id)
    ),
  });

  if (!member) {
    return { error: "You are not a member." };
  }

  if (member.role === "admin") {
    const otherMembers = await db.query.groupMembers.findMany({
      where: eq(groupMembers.groupId, groupId),
    });
    if (otherMembers.length > 1) {
      return {
        error: "Admins must transfer ownership before leaving.",
      };
    }
  }

  await db
    .delete(groupMembers)
    .where(eq(groupMembers.id, member.id));

  revalidatePath("/chat");
  redirect("/chat");
}

export async function searchUsers(query: string): Promise<
  { id: string; fullName: string; email: string; avatarUrl: string | null }[]
> {
  if (!query || query.length < 2) return [];

  const results = await db.query.users.findMany({
    limit: 10,
  });

  return results
    .filter(
      (u) =>
        u.fullName.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
    )
    .map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      avatarUrl: u.avatarUrl,
    }));
}

export async function addMemberToGroup(
  groupId: string,
  userId: string
): Promise<{ error?: string }> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "You must be logged in." };
  }

  const adminCheck = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.userId, currentUser.id)
    ),
  });

  if (!adminCheck || adminCheck.role !== "admin") {
    return { error: "Only admins can add members." };
  }

  const existing = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.userId, userId)
    ),
  });

  if (existing) {
    return { error: "User is already a member." };
  }

  await db.insert(groupMembers).values({
    groupId,
    userId,
    role: "member",
  });

  revalidatePath(`/chat/${groupId}`);
  return {};
}

export async function removeMemberFromGroup(
  groupId: string,
  userId: string
): Promise<{ error?: string }> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "You must be logged in." };
  }

  const adminCheck = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.userId, currentUser.id)
    ),
  });

  if (!adminCheck || adminCheck.role !== "admin") {
    return { error: "Only admins can remove members." };
  }

  if (userId === currentUser.id) {
    return { error: "You cannot remove yourself. Use Leave Group instead." };
  }

  await db
    .delete(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId)
      )
    );

  revalidatePath(`/chat/${groupId}`);
  return {};
}

export async function updateGroupRole(
  groupId: string,
  userId: string,
  role: "admin" | "member"
): Promise<{ error?: string }> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "You must be logged in." };
  }

  const adminCheck = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.userId, currentUser.id)
    ),
  });

  if (!adminCheck || adminCheck.role !== "admin") {
    return { error: "Only admins can manage roles." };
  }

  await db
    .update(groupMembers)
    .set({ role })
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId)
      )
    );

  revalidatePath(`/chat/${groupId}`);
  return {};
}

export async function updateGroupInfo(
  groupId: string,
  name: string,
  description: string | null
): Promise<{ error?: string }> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "You must be logged in." };
  }

  const adminCheck = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.userId, currentUser.id)
    ),
  });

  if (!adminCheck || adminCheck.role !== "admin") {
    return { error: "Only admins can edit group info." };
  }

  if (!name || name.trim().length < 2) {
    return { error: "Group name must be at least 2 characters." };
  }

  await db
    .update(groups)
    .set({
      name: name.trim(),
      description: description ? description.trim() : null,
      updatedAt: new Date(),
    })
    .where(eq(groups.id, groupId));

  revalidatePath(`/chat/${groupId}`);
  revalidatePath("/chat");
  return {};
}

