import { useChat } from "ai/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ChatThread({ originalQuestion }: { originalQuestion: string }) {
  const [messages, setMessages] = useState([
    { role: "system", content: `Thread started for: "${originalQuestion}"` },
  ]);
  const chat = useChat({
    api: "/api/chat", // Use the same API as the main chat
  });

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <div className="max-h-60 overflow-y-auto space-y-2">
        {messages.map((msg, i) => (
          <p
            key={i}
            className={msg.role === "user" ? "text-white" : "text-gray-400"}
          >
            {msg.content}
          </p>
        ))}
      </div>
      <input
        value={chat.input}
        onChange={chat.handleInputChange}
        className="mt-2 w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
        placeholder="Type your reply..."
      />
      <Button
        onClick={() => chat.handleSubmit()}
        className="mt-2 w-full py-2 bg-blue-500 hover:bg-blue-600 transition rounded text-white"
      >
        Send
      </Button>
    </div>
  );
}
