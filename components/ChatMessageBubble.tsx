import { cn } from "@/utils/cn";
import type { Message } from "ai/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { CodeBlock } from "@/components/ui/extended/code-block";
import { ClickableListItem } from "@/components/ui/extended/clickable-list-item";
import { ChatThread } from "@/components/ChatThread";
import { useState } from "react";
import { ThreadModal } from "@/components/ThreadModal";

function cleanText(text: string): string {
  return text;
  // .replace(/\n{3,}/g, "\n\n")
  // .replace(/\s{2,}/g, " ")
  // .trim();
}

export function ChatMessageBubble(props: {
  message: Message;
  aiEmoji?: string;
  sources: any[];
}) {
  return (
    <div
      className={cn(
        "rounded-[24px] max-w-[100%] mb-8 flex",
        props.message.role === "user"
          ? "bg-secondary text-secondary-foreground px-4 py-2"
          : null,
        props.message.role === "user" ? "ml-auto" : "mr-auto",
      )}
    >
      {props.message.role !== "user" && (
        <div className="mr-4 border bg-secondary -mt-2 rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center">
          {props.aiEmoji}
        </div>
      )}

      <div className="whitespace-pre-wrap flex flex-col">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-medium">{children}</h3>
            ),
            p: ({ children }) => <p className="my-2">{children}</p>,
            ul: ({ children }) => (
              <ul className="list-disc pl-5">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-5">{children}</ol>
            ),
            li: ({ children }) => (
              <ClickableListItem onClick={() => {}}>
                {typeof children === "string"
                  ? children.replace(/\n{3,}/g, "\n\n").trim()
                  : children}
              </ClickableListItem>
            ),
            a: ({ href, children }) => (
              <a
                href={href!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                {children}
              </a>
            ),
            code({ className, children }: any) {
              return <CodeBlock code={String(children).replace(/\n$/, "")} />;
            },
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-gray-400 pl-4 italic">
                {children}
              </blockquote>
            ),
            table: ({ children }) => (
              <table className="border-collapse border border-gray-400 w-full">
                {children}
              </table>
            ),
            thead: ({ children }) => (
              <thead className="bg-gray-200 dark:bg-gray-700">{children}</thead>
            ),
            tr: ({ children }) => (
              <tr className="border border-gray-300">{children}</tr>
            ),
            th: ({ children }) => (
              <th className="border border-gray-300 px-2 py-1 text-left">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-gray-300 px-2 py-1">{children}</td>
            ),
          }}
        >
          {cleanText(props.message.content)}
        </ReactMarkdown>

        {props.sources && props.sources.length ? (
          <>
            <div className="mt-4 mr-auto bg-primary px-2 py-1 rounded">
              <h2>🔍 Sources:</h2>
            </div>
            <div className="mt-1 mr-2 bg-primary px-2 py-1 rounded text-xs">
              {props.sources?.map((source, i) => (
                <div className="mt-2" key={"source:" + i}>
                  {i + 1}. &quot;{source.pageContent}&quot;
                  {source.metadata?.loc?.lines !== undefined ? (
                    <div>
                      <br />
                      Lines {source.metadata?.loc?.lines?.from} to{" "}
                      {source.metadata?.loc?.lines?.to}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
