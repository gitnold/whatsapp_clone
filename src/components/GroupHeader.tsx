"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import type { GroupWithMembers, User } from "@/lib/definitions";
import {
  searchUsers,
  addMemberToGroup,
  removeMemberFromGroup,
  updateGroupRole,
  updateGroupInfo,
  leaveGroup,
} from "@/app/actions/groups";

type GroupHeaderProps = {
  group: GroupWithMembers;
  currentUser: User;
};

export default function GroupHeader({ group, currentUser }: GroupHeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const [editDesc, setEditDesc] = useState(group.description || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  
  const [isPending, startTransition] = useTransition();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isAdmin = group.members.some(
    (m) => m.userId === currentUser.id && m.role === "admin"
  );

  // Sync edits when group prop changes
  useEffect(() => {
    setEditName(group.name);
    setEditDesc(group.description || "");
  }, [group]);

  // Handle member search autocomplete
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchUsers(searchQuery);
      // Filter out existing members
      const filtered = results.filter(
        (r) => !group.members.some((m) => m.userId === r.id)
      );
      setSearchResults(filtered);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, group.members]);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    startTransition(async () => {
      const res = await updateGroupInfo(group.id, editName.trim(), editDesc.trim());
      if (res.error) {
        setActionError(res.error);
      } else {
        setIsEditing(false);
        setActionError(null);
      }
    });
  };

  const handleAddMember = async (userId: string) => {
    setActionError(null);
    startTransition(async () => {
      const res = await addMemberToGroup(group.id, userId);
      if (res.error) {
        setActionError(res.error);
      } else {
        setSearchQuery("");
        setShowSearchResults(false);
      }
    });
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    setActionError(null);
    startTransition(async () => {
      const res = await removeMemberFromGroup(group.id, userId);
      if (res.error) {
        setActionError(res.error);
      }
    });
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === "admin" ? "member" : "admin";
    setActionError(null);
    startTransition(async () => {
      const res = await updateGroupRole(group.id, userId, nextRole);
      if (res.error) {
        setActionError(res.error);
      }
    });
  };

  const handleLeaveGroup = async () => {
    setActionError(null);
    startTransition(async () => {
      const res = await leaveGroup(group.id);
      if (res.error) {
        setActionError(res.error);
        setShowLeaveConfirm(false);
      }
    });
  };

  const memberNames = group.members
    .map((m) => (m.userId === currentUser.id ? "You" : m.user.fullName))
    .join(", ");

  return (
    <>
      {/* Header bar */}
      <div className="h-[60px] bg-wa-hover border-b border-wa-border flex items-center justify-between px-4 shrink-0 select-none">
        <div
          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
          onClick={() => setIsDrawerOpen(true)}
        >
          <div className="w-10 h-10 rounded-full bg-wa-green-light flex items-center justify-center text-wa-green font-bold text-lg shrink-0">
            {group.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-wa-text text-sm truncate">
              {group.name}
            </h3>
            <p className="text-xs text-wa-text-secondary truncate">
              {group.members.length} members: {memberNames}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-wa-text-secondary hover:bg-black/5 transition-colors"
            title="Group Info"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.433.262 2.433 1.538v3.402c0 .416-.214.803-.564 1.025l-.474.301a.75.75 0 0 0 .83 1.25l.473-.3a2.53 2.53 0 0 0 1.238-2.176V12.09a3.03 3.03 0 0 0-4.869-2.48l-.48.337a.75.75 0 1 0 .86 1.23l.477-.333ZM12 7.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Slide-out Drawer Panel */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 transition-opacity"
            onClick={() => {
              setIsDrawerOpen(false);
              setIsEditing(false);
              setActionError(null);
            }}
          />

          {/* Panel content */}
          <div className="relative w-96 max-w-full bg-white h-full shadow-2xl flex flex-col z-10 border-l border-wa-border animate-slide-in">
            {/* Drawer Header */}
            <div className="h-[60px] bg-wa-hover border-b border-wa-border flex items-center px-4 gap-4">
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  setIsEditing(false);
                  setActionError(null);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-wa-text hover:bg-black/5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 1 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <h2 className="font-semibold text-wa-text text-base">Group Info</h2>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {actionError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                  {actionError}
                </div>
              )}

              {/* Group Hero Info */}
              <div className="flex flex-col items-center text-center pb-6 border-b border-wa-border">
                <div className="w-24 h-24 rounded-full bg-wa-green-light flex items-center justify-center text-wa-green font-bold text-4xl shadow-sm mb-4">
                  {group.name.charAt(0).toUpperCase()}
                </div>

                {!isEditing ? (
                  <>
                    <h3 className="text-xl font-semibold text-wa-text flex items-center gap-2">
                      {group.name}
                      {isAdmin && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="text-wa-text-secondary hover:text-wa-green"
                          title="Edit group details"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-4 h-4"
                          >
                            <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.313.313-.689.544-1.106.67l-3.158 1.263a.75.75 0 0 1-.926-.926Z" />
                            <path d="M8.132 10.12a2.5 2.5 0 0 0 1.748 1.747l3.447-3.448A4.015 4.015 0 0 1 12 8c-.396 0-.78-.058-1.144-.167L8.132 10.12ZM2 15a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V9.121l-3 3V15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h2.879l3-3H5a3 3 0 0 0-3 3v12Z" />
                          </svg>
                        </button>
                      )}
                    </h3>
                    <p className="text-sm text-wa-text-secondary mt-1 whitespace-pre-line max-w-sm">
                      {group.description || "No description provided."}
                    </p>
                  </>
                ) : (
                  <form onSubmit={handleUpdateInfo} className="w-full space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 border border-wa-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-wa-green font-medium"
                      placeholder="Group name"
                      required
                    />
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full px-3 py-2 border border-wa-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-wa-green h-20 resize-none"
                      placeholder="Group description"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setEditName(group.name);
                          setEditDesc(group.description || "");
                        }}
                        className="px-3 py-1.5 text-sm text-wa-text-secondary hover:bg-wa-hover rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isPending}
                        className="px-4 py-1.5 text-sm bg-wa-green text-white rounded-lg hover:bg-wa-green-dark transition-colors disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Add Member (Admin Only) */}
              {isAdmin && (
                <div className="space-y-2 pb-6 border-b border-wa-border relative">
                  <h4 className="font-semibold text-wa-text text-sm">Add Member</h4>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSearchResults(true);
                      }}
                      onFocus={() => setShowSearchResults(true)}
                      placeholder="Search users by name or email"
                      className="w-full px-3 py-2 pl-9 border border-wa-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-wa-green"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4 text-wa-text-secondary absolute left-3 top-3"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        className="absolute right-3 top-3 text-wa-text-secondary hover:text-wa-text"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Search Results Dropdown */}
                  {showSearchResults && searchQuery.trim().length >= 2 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-wa-border rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto divide-y divide-wa-border">
                      {searchResults.length === 0 ? (
                        <div className="p-3 text-center text-xs text-wa-text-secondary">
                          No users found (or already in group)
                        </div>
                      ) : (
                        searchResults.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => handleAddMember(user.id)}
                            className="w-full text-left px-3 py-2 hover:bg-wa-hover flex items-center justify-between text-sm transition-colors"
                          >
                            <div>
                              <p className="font-medium text-wa-text">
                                {user.fullName}
                              </p>
                              <p className="text-xs text-wa-text-secondary">
                                {user.email}
                              </p>
                            </div>
                            <span className="text-xs text-wa-green font-semibold">
                              Add
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Members List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-wa-text text-sm">
                    Members ({group.members.length})
                  </h4>
                </div>
                <div className="divide-y divide-wa-border">
                  {group.members.map((member) => {
                    const isSelf = member.userId === currentUser.id;
                    return (
                      <div
                        key={member.id}
                        className="py-2.5 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-wa-green-light flex items-center justify-center text-wa-green font-semibold text-sm shrink-0">
                            {member.user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-wa-text truncate">
                              {member.user.fullName}
                              {isSelf && (
                                <span className="ml-1 text-xs text-wa-text-secondary font-normal">
                                  (You)
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-wa-text-secondary truncate">
                              {member.user.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {member.role === "admin" && (
                            <span className="text-[10px] bg-emerald-50 text-wa-green border border-emerald-200/50 px-2 py-0.5 rounded font-medium">
                              Group Admin
                            </span>
                          )}

                          {/* Member management actions (Admin only, can't manage self) */}
                          {isAdmin && !isSelf && (
                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                              <button
                                onClick={() =>
                                  handleToggleRole(member.userId, member.role)
                                }
                                className="px-2 py-1 text-xs border border-wa-border rounded hover:bg-wa-hover text-wa-text-secondary hover:text-wa-text transition-colors"
                                title={
                                  member.role === "admin"
                                    ? "Demote to Member"
                                    : "Promote to Admin"
                                }
                              >
                                {member.role === "admin" ? "Demote" : "Admin"}
                              </button>
                              <button
                                onClick={() => handleRemoveMember(member.userId)}
                                className="px-2 py-1 text-xs border border-red-100 text-red-600 rounded hover:bg-red-50 transition-colors"
                                title="Remove member"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Footer / Exit Action */}
            <div className="p-4 border-t border-wa-border bg-wa-hover shrink-0">
              <button
                onClick={() => setShowLeaveConfirm(true)}
                className="w-full py-2.5 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 border border-red-200/20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M19 10a.75.75 0 0 0-.75-.75H9a.75.75 0 0 0 0 1.5h9.25A.75.75 0 0 0 19 10Z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M15.78 7.22a.75.75 0 0 0-1.06 1.06L17.44 11l-2.72 2.72a.75.75 0 1 0 1.06 1.06l3.25-3.25a.75.75 0 0 0 0-1.06l-3.25-3.25Z"
                    clipRule="evenodd"
                  />
                </svg>
                Leave Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Group Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowLeaveConfirm(false)}
          />
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 relative z-10 space-y-4 border border-wa-border animate-fade-in">
            <h3 className="font-semibold text-wa-text text-lg">Leave group?</h3>
            <p className="text-sm text-wa-text-secondary">
              Are you sure you want to leave the group &quot;{group.name}&quot;? You will no longer receive or be able to send messages in this group.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowLeaveConfirm(false)}
                className="px-4 py-2 border border-wa-border text-sm text-wa-text-secondary hover:bg-wa-hover rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLeaveGroup}
                disabled={isPending}
                className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Leave Group
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
