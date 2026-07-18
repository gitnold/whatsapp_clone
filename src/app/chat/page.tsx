import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import { getGroups } from "@/app/actions/groups";
import ChatSidebar from "@/components/ChatSidebar";
import EmptyChat from "@/components/EmptyChat";

export default async function ChatRootPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const groups = await getGroups();

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
        <ChatSidebar currentUser={user} groups={groups} />
        <EmptyChat />
      </div>
    </div>
  );
}
