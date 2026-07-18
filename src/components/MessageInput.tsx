"use client";

import { useState, useRef } from "react";
import { sendMessage } from "@/app/actions/groups";

type MessageInputProps = {
  groupId: string;
};

export default function MessageInput({ groupId }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    const content = message.trim();
    setMessage("");
    setSending(true);

    const result = await sendMessage(groupId, content);

    if (result.error) {
      setMessage(content);
    }

    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-wa-input-bg border-t border-wa-border px-4 py-3">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            rows={1}
            className="w-full px-4 py-2.5 bg-wa-input-bg border border-wa-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-wa-green resize-none overflow-hidden"
            style={{ minHeight: "42px", maxHeight: "120px" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />
        </div>
        <button
          type="submit"
          disabled={!message.trim() || sending}
          className="w-10 h-10 rounded-full bg-wa-green hover:bg-wa-green-dark text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
