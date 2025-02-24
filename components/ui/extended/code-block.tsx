"use client";

import * as React from "react";
import { cn } from "@/utils/cn";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyButton } from "@/components/ui/base/copy-button";

interface CodeBlockProps {
  code: string;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, className }) => {
  return (
    <div
      className={cn(
        "relative w-full rounded-md overflow-hidden bg-background border border-border",
        className,
      )}
    >
      <div className="absolute top-2 right-2">
        <CopyButton contentToCopy={code} />
      </div>

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");

            return match ? (
              <SyntaxHighlighter
                style={dracula}
                PreTag="div"
                language={match[1]}
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                {children}
              </code>
            );
          },
        }}
      >
        {`\`\`\`tsx\n${code}\n\`\`\``}
      </ReactMarkdown>
    </div>
  );
};

export { CodeBlock };
