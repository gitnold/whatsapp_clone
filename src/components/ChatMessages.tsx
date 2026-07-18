"use client";

import { useEffect, useRef } from "react";
import type { MessageWithUser } from "@/lib/definitions";

type ChatMessagesProps = {
  messages: MessageWithUser[];
  currentUserId: string;
};

export default function ChatMessages({
  messages,
  currentUserId,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 chat-bg flex items-center justify-center">
        <div className="text-center text-wa-text-secondary">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-wa-green-light flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-10 h-10 text-wa-green"
            >
              <path d="M4.913 2.651c-1.118-.252-2.196.057-2.784.872a.75.75 0 0 0 .16 1.073l3.26 1.796 2.096 3.634a.75.75 0 0 0 1.258.087l2.35-2.708 2.784.763a.75.75 0 0 0 .88-.484l.9-2.7a.75.75 0 0 0-.194-.734l-3.3-2.37a.75.75 0 0 0-.992.064L11.5 8.215l-1.95-3.368a.75.75 0 0 0-.637-.296l-3.3.785a.75.75 0 0 0-.5-.835l-.7-.14Z" />
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.13 4.5 4.5 0 0 1 5.212 0c.89.777.89 2.043 0 2.82a3.11 3.11 0 0 1-4.222 0 .75.75 0 0 1 .988-1.13 1.61 1.61 0 0 0 2.246 0ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="font-medium text-wa-text">No messages yet</p>
          <p className="text-sm mt-1">
            Send the first message to start the conversation
          </p>
        </div>
      </div>
    );
  }

  const groupedMessages = messages.reduce<
    { date: string; messages: MessageWithUser[] }[]
  >((groups, msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString();
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && lastGroup.date === date) {
      lastGroup.messages.push(msg);
    } else {
      groups.push({ date, messages: [msg] });
    }

    return groups;
  }, []);

  return (
    <div className="flex-1 overflow-y-auto chat-bg px-16 py-4">
      {groupedMessages.map((group) => (
        <div key={group.date}>
          <div className="flex justify-center my-4">
            <span className="bg-white/90 text-wa-text-secondary text-xs px-3 py-1 rounded-lg shadow-sm">
              {group.date === new Date().toLocaleDateString()
                ? "Today"
                : group.date}
            </span>
          </div>
          {group.messages.map((msg) => {
            const isOwn = msg.userId === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex mb-1 ${
                  isOwn ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[65%] px-3 py-2 rounded-lg shadow-sm message-bubble ${
                    isOwn
                      ? "bg-wa-outgoing message-outgoing rounded-tr-none"
                      : "bg-wa-incoming message-incoming rounded-tl-none"
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs font-medium text-wa-green mb-0.5">
                      {msg.user.fullName}
                    </p>
                  )}
                  <p className="text-sm text-wa-text leading-relaxed break-words">
                    {msg.content}
                  </p>
                  <p
                    className={`text-[10px] text-wa-text-secondary mt-1 text-right ${
                      isOwn ? "text-wa-green/70" : ""
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
