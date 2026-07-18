"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User, GroupWithMembers } from "@/lib/definitions";
import { logout } from "@/app/actions/auth";
import { createGroup, joinGroup } from "@/app/actions/groups";

type ChatSidebarProps = {
  currentUser: User;
  groups?: GroupWithMembers[];
  activeGroupId?: string;
};

export default function ChatSidebar({
  currentUser,
  groups = [],
  activeGroupId,
}: ChatSidebarProps) {
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"chats" | "discover">("chats");
  const router = useRouter();

  const joinedGroups = groups.filter((g) =>
    g.members.some((m) => m.userId === currentUser.id)
  );

  const discoverGroups = groups.filter(
    (g) => !g.members.some((m) => m.userId === currentUser.id)
  );

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    setCreating(true);

    const formData = new FormData();
    formData.set("name", groupName.trim());
    formData.set("description", groupDesc.trim());

    try {
      const res = await createGroup(undefined, formData);
      if (res && (res.errors || res.message)) {
        alert(res.message || res.errors?.name?.[0] || "Failed to create group");
      } else {
        setShowNewGroup(false);
        setGroupName("");
        setGroupDesc("");
      }
    } catch (err) {
      // If next/navigation redirect is thrown, it is normal and will be handled by next.js
      console.log("Create group completed/redirecting", err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="w-80 border-r border-wa-border bg-wa-sidebar-bg flex flex-col shrink-0">
      <div className="p-3 border-b border-wa-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-wa-text">Groups</h2>
          <button
            onClick={() => setShowNewGroup(!showNewGroup)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-wa-text-secondary hover:bg-wa-hover transition-colors"
            title="New Group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M12 4.5a.75.75 0 0 1 .75.75v6h6a.75.75 0 0 1 0 1.5h-6v6a.75.75 0 0 1-1.5 0v-6h-6a.75.75 0 0 1 0-1.5h6v-6a.75.75 0 0 1 .75-.75Z" />
            </svg>
          </button>
        </div>

        {showNewGroup && (
          <form onSubmit={handleCreateGroup} className="space-y-2">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              className="w-full px-3 py-2 border border-wa-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-wa-green"
              required
              autoFocus
            />
            <input
              type="text"
              value={groupDesc}
              onChange={(e) => setGroupDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full px-3 py-2 border border-wa-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-wa-green"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowNewGroup(false)}
                className="flex-1 px-3 py-1.5 text-sm text-wa-text-secondary hover:bg-wa-hover rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || !groupName.trim()}
                className="flex-1 px-3 py-1.5 text-sm bg-wa-green text-white rounded-lg hover:bg-wa-green-dark transition-colors disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-wa-border bg-wa-sidebar-bg shrink-0">
        <button
          onClick={() => setActiveTab("chats")}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-center border-b-2 transition-all duration-200 ${
            activeTab === "chats"
              ? "border-wa-green text-wa-green font-bold"
              : "border-transparent text-wa-text-secondary hover:text-wa-text hover:bg-wa-hover"
          }`}
        >
          My Chats ({joinedGroups.length})
        </button>
        <button
          onClick={() => setActiveTab("discover")}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-center border-b-2 transition-all duration-200 ${
            activeTab === "discover"
              ? "border-wa-green text-wa-green font-bold"
              : "border-transparent text-wa-text-secondary hover:text-wa-text hover:bg-wa-hover"
          }`}
        >
          Discover ({discoverGroups.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "chats" ? (
          joinedGroups.length === 0 ? (
            <div className="p-6 text-center text-wa-text-secondary text-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-wa-hover flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-8 text-wa-text-secondary"
                >
                  <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
                </svg>
              </div>
              <p>No chats yet</p>
              <p className="mt-1 text-xs">
                Create a group or join one from the Discover tab
              </p>
            </div>
          ) : (
            joinedGroups.map((group) => (
              <Link
                key={group.id}
                href={`/chat/${group.id}`}
                className={`flex items-center gap-3 px-3 py-3 hover:bg-wa-hover transition-colors border-b border-wa-border ${
                  activeGroupId === group.id ? "bg-wa-hover" : ""
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-wa-green-light flex items-center justify-center text-wa-green font-bold text-lg shrink-0">
                  {group.name?.charAt(0)?.toUpperCase() || "G"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-wa-text text-sm truncate">
                      {group.name}
                    </h3>
                    {group.lastMessage && (
                      <span className="text-xs text-wa-text-secondary shrink-0 ml-2">
                        {new Date(
                          group.lastMessage.createdAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-wa-text-secondary truncate">
                      {group.lastMessage
                        ? `${group.lastMessage.user.fullName}: ${group.lastMessage.content}`
                        : group.description || "No messages yet"}
                    </p>
                    <span className="text-xs text-wa-text-secondary shrink-0 ml-2">
                      {group.members?.length || 0} members
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )
        ) : discoverGroups.length === 0 ? (
          <div className="p-6 text-center text-wa-text-secondary text-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-wa-hover flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8 text-wa-text-secondary"
              >
                <path d="M8.25 10.875a2.625 2.625 0 1 1 5.25 0 2.625 2.625 0 0 1-5.25 0ZM11.5 14.875a5.125 5.125 0 0 0-5.125 5.125.75.75 0 0 0 .375.65 11.233 11.233 0 0 0 9.5 0 .75.75 0 0 0 .375-.65 5.125 5.125 0 0 0-5.125-5.125Z" />
              </svg>
            </div>
            <p>No new groups found</p>
            <p className="mt-1 text-xs">You have already joined all available groups</p>
          </div>
        ) : (
          discoverGroups.map((group) => (
            <div
              key={group.id}
              className="flex items-center gap-3 px-3 py-3 border-b border-wa-border hover:bg-wa-hover/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-wa-green-light flex items-center justify-center text-wa-green font-bold text-lg shrink-0">
                {group.name?.charAt(0)?.toUpperCase() || "G"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-wa-text text-sm truncate">
                    {group.name}
                  </h3>
                  <span className="text-xs text-wa-text-secondary shrink-0 ml-2">
                    {group.members?.length || 0} members
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 gap-2">
                  <p className="text-xs text-wa-text-secondary truncate flex-1">
                    {group.description || "No description provided."}
                  </p>
                  <button
                    onClick={async () => {
                      const res = await joinGroup(group.id);
                      if (res.error) {
                        alert(res.error);
                      } else {
                        router.push(`/chat/${group.id}`);
                      }
                    }}
                    className="px-3 py-1 bg-wa-green hover:bg-wa-green-dark text-white text-xs font-semibold rounded-full transition-colors shrink-0"
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-wa-border">
        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-wa-text-secondary hover:bg-wa-hover rounded-lg transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9a.75.75 0 0 1-1.5 0V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}
