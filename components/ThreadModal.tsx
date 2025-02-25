"use client";

import { useEffect, useState } from "react";
import { ChatThread } from "@/components/ChatThread";
import { cn } from "@/utils/cn";
import { ChatMessages } from "@/components/ChatWindow";

export function ThreadModal({
  threadMessage,
  onClose,
}: {
  threadMessage: string | null;
  onClose: () => void;
}) {
  const [threadedResponse, setThreadedResponse] = useState<string | null>(null);

  useEffect(() => {
    if (threadMessage) {
      setThreadedResponse(
        `AI Response: Here’s an answer related to "${threadMessage}".`,
      );
    }
  }, [threadMessage]);

  return (
    <div
      className={cn(
        "fixed top-0 right-0 h-full w-[100%] max-w-[60%] bg-gray-900 border-l border-gray-700 shadow-lg transition-transform duration-300",
        threadMessage ? "translate-x-0" : "translate-x-full",
      )}
    >
      {/* Header with Close Button */}
    </div>
  );
}
