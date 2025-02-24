"use client";

import { useEffect, useState } from "react";
import { ChatThread } from "@/components/ChatThread";
import { cn } from "@/utils/cn";

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
        "fixed top-0 right-0 h-full w-[80%] max-w-[600px] bg-gray-900 border-l border-gray-700 shadow-lg transition-transform duration-300",
        threadMessage ? "translate-x-0" : "translate-x-full",
      )}
    >
      {/* Header with Close Button */}
      <div className="p-4 flex justify-between items-center border-b border-gray-700 bg-gray-800">
        <h3 className="text-lg font-semibold text-white">Threaded Chat</h3>
        <button
          className="text-white bg-red-600 px-3 py-1 rounded-md hover:bg-red-700"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      {/* Chat Thread Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {threadMessage && (
          <>
            <div className="text-lg font-semibold text-white mb-2">
              Threaded Question: {threadMessage}
            </div>
            <ChatThread originalQuestion={threadMessage} />
            {threadedResponse && (
              <div className="mt-4 p-3 bg-gray-800 rounded-md border border-gray-700 text-white">
                {threadedResponse}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
