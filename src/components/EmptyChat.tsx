"use client";

export default function EmptyChat() {
  return (
    <div className="flex-1 bg-[#f8f9fa] border-l border-wa-border flex flex-col items-center justify-center p-8 text-center select-none relative">
      <div className="max-w-md flex flex-col items-center">
        {/* WhatsApp Icon illustration */}
        <div className="w-48 h-48 mb-8 rounded-full bg-emerald-50 flex items-center justify-center relative shadow-sm border border-emerald-100/50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-24 h-24 text-wa-green/80"
          >
            <path
              fillRule="evenodd"
              d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.378.202 2.41 1.401 2.41 2.795v11.758c0 1.226-.816 2.295-2.003 2.507l-2.02.359a24.238 24.238 0 0 1-7.23 0l-2.02-.359C4.128 19.619 3.3 18.528 3.3 17.324V5.566c0-1.394 1.03-2.593 2.408-2.795L4.848 2.77Z"
              clipRule="evenodd"
            />
            <path d="M12 5.25a.75.75 0 0 1 .75.75v3.75H16.5a.75.75 0 0 1 0 1.5h-3.75V15a.75.75 0 0 1-1.5 0v-3.75H7.5a.75.75 0 0 1 0-1.5h3.75V6a.75.75 0 0 1 .75-.75Z" />
          </svg>
          {/* Decorative badges */}
          <div className="absolute -top-1 -right-1 bg-wa-green text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
            Web
          </div>
        </div>

        <h1 className="text-[32px] font-light text-[#41525d] mb-4 tracking-tight">
          WhatsApp Web
        </h1>
        <p className="text-sm text-wa-text-secondary leading-relaxed mb-8">
          Send and receive messages without keeping your phone online.
          <br />
          Create or select a group from the sidebar to start a conversation.
        </p>

        <div className="w-full h-[1px] bg-wa-border mb-8"></div>

        <div className="flex items-center gap-1.5 text-xs text-wa-text-secondary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-3.5 h-3.5 text-wa-text-secondary"
          >
            <path
              fillRule="evenodd"
              d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
              clipRule="evenodd"
            />
          </svg>
          <span>End-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
}
