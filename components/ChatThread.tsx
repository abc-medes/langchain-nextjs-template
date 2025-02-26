"use client";

import { Message } from "ai";
// import { useEffect, useState } from "react";
// import { cn } from "@/utils/cn";

// export function ThreadModal({
//   threadId,
//   onClose,
// }: {
//   threadId: string | null;
//   onClose: () => void;
// }) {
//   const [threadedResponse, setThreadedResponse] = useState<string | null>(null);

//   useEffect(() => {
//     if (threadId) {
//       setThreadedResponse(
//         `AI Response: Here’s an answer related to "${threadId}".`,
//       );
//     }
//   }, [threadId]);

//   return (
//     <div
//       className={cn(
//         "fixed top-0 right-0 h-full w-[100%] max-w-[60%] bg-gray-900 border-l border-gray-700 shadow-lg transition-transform duration-300",
//         threadId ? "translate-x-0" : "translate-x-full",
//       )}
//     ></div>
//   );
// }

import { useEffect, useRef } from "react";
import { ChatMessages } from "./ChatWindow";
import { Thread } from "@/store/useThreadsStore";

export function ChatThread({
  selectedThread,
  clearThread,
  props,
}: {
  selectedThread: Record<string, Thread>;
  clearThread: () => void;
  props: {
    messages: Message[];
    sourcesForMessages: Record<string, any>;
    aiEmoji?: string;
    className?: string;
  };
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: any) {
      if (e.key === "Escape") {
        clearThread();
      }
    }

    if (selectedThread) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedThread, clearThread]);

  function handleClickOutside(e: any) {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      clearThread();
    }
  }

  return (
    <div
      className={`fixed inset-0 flex items-center justify-end bg-gray-800/20 ${
        selectedThread
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      } transition-opacity`}
      onClick={handleClickOutside}
    >
      <div
        ref={modalRef}
        className={`h-full shadow-lg w-3/5 transition-transform duration-300 ${
          selectedThread ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
      >
        <ChatMessages
          messages={props.messages}
          aiEmoji={props.aiEmoji}
          sourcesForMessages={props.sourcesForMessages}
          emptyStateComponent={<></>}
        />
      </div>
    </div>
  );
}
