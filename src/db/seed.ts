import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { eq } from "drizzle-orm";

async function seed() {
  const { db } = await import("./index");
  const { users, groups, groupMembers, messages } = await import("./schema");

  console.log("Seeding database...");

  // 1. Create mock users
  const mockUsers = [
    {
      email: "alice@example.com",
      fullName: "Alice Smith",
    },
    {
      email: "bob@example.com",
      fullName: "Bob Johnson",
    },
    {
      email: "charlie@example.com",
      fullName: "Charlie Brown",
    },
  ];

  const createdUsers = [];
  for (const user of mockUsers) {
    // Check if user already exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email));

    if (existing) {
      createdUsers.push(existing);
      console.log(`User ${user.email} already exists.`);
    } else {
      const [inserted] = await db
        .insert(users)
        .values({
          email: user.email,
          fullName: user.fullName,
        })
        .returning();
      createdUsers.push(inserted);
      console.log(`Created user: ${user.fullName}`);
    }
  }

  const [alice, bob, charlie] = createdUsers;

  // 2. Create mock groups
  const mockGroups = [
    {
      name: "Family Chats",
      description: "A place for family discussion and planning events.",
      createdBy: alice.id,
    },
    {
      name: "Developers Corner",
      description: "Discussion about Next.js 16, React 19, and Drizzle ORM.",
      createdBy: bob.id,
    },
  ];

  const createdGroups = [];
  for (const group of mockGroups) {
    const [existing] = await db
      .select()
      .from(groups)
      .where(eq(groups.name, group.name));

    if (existing) {
      createdGroups.push(existing);
      console.log(`Group ${group.name} already exists.`);
    } else {
      const [inserted] = await db.insert(groups).values(group).returning();
      createdGroups.push(inserted);
      console.log(`Created group: ${group.name}`);
    }
  }

  const [familyGroup, devGroup] = createdGroups;

  // 3. Add members to groups
  const memberships = [
    // Family Group Members
    { groupId: familyGroup.id, userId: alice.id, role: "admin" },
    { groupId: familyGroup.id, userId: bob.id, role: "member" },
    { groupId: familyGroup.id, userId: charlie.id, role: "member" },
    // Dev Group Members
    { groupId: devGroup.id, userId: bob.id, role: "admin" },
    { groupId: devGroup.id, userId: alice.id, role: "member" },
  ];

  for (const member of memberships) {
    const [existing] = await db
      .select()
      .from(groupMembers)
      .where(
        eq(groupMembers.groupId, member.groupId) &&
          eq(groupMembers.userId, member.userId)
      );

    if (existing) {
      console.log(`User ${member.userId} is already a member of group ${member.groupId}.`);
    } else {
      await db.insert(groupMembers).values(member);
      console.log(`Added user ${member.userId} to group ${member.groupId}.`);
    }
  }

  // 4. Create initial messages
  const initialMessages = [
    {
      groupId: familyGroup.id,
      userId: alice.id,
      content: "Hey everyone! Welcome to the family group chat.",
    },
    {
      groupId: familyGroup.id,
      userId: bob.id,
      content: "Hi Alice! Great idea starting this group.",
    },
    {
      groupId: familyGroup.id,
      userId: charlie.id,
      content: "Hello! Glad to be here.",
    },
    {
      groupId: devGroup.id,
      userId: bob.id,
      content: "What do you all think about Next.js 16 Server Actions?",
    },
    {
      groupId: devGroup.id,
      userId: alice.id,
      content: "They are awesome! Single roundtrip data + UI update is neat.",
    },
  ];

  for (const msg of initialMessages) {
    const [existing] = await db
      .select()
      .from(messages)
      .where(
        eq(messages.groupId, msg.groupId) &&
          eq(messages.userId, msg.userId) &&
          eq(messages.content, msg.content)
      );

    if (existing) {
      console.log("Message already exists.");
    } else {
      await db.insert(messages).values(msg);
      console.log(`Created message in group ${msg.groupId}`);
    }
  }

  console.log("Seeding completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Failed to seed database:", err);
  process.exit(1);
});
