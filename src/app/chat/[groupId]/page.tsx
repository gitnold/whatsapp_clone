import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import { getAllGroups, getGroupById, getMessages } from "@/app/actions/groups";
import ChatSidebar from "@/components/ChatSidebar";
import ChatMessages from "@/components/ChatMessages";
import MessageInput from "@/components/MessageInput";
import GroupHeader from "@/components/GroupHeader";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { groupId } = await params;
  const [group, messages, groups] = await Promise.all([
    getGroupById(groupId),
    getMessages(groupId),
    getAllGroups(),
  ]);

  if (!group) redirect("/chat");

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-wa-header-bg text-white px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-wa-green flex items-center justify-center text-white font-bold text-sm">
            {user.fullName?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <span className="font-medium">{user.fullName}</span>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar currentUser={user} groups={groups} activeGroupId={groupId} />
        <div className="flex-1 flex flex-col">
          <GroupHeader key={group.id} group={group} currentUser={user} />
          <ChatMessages messages={messages} currentUserId={user.id} />
          <MessageInput groupId={groupId} />
        </div>
      </div>
    </div>
  );
}
