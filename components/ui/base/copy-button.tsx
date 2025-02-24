import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";
import { CheckIcon, ClipboardIcon } from "lucide-react";

const copyButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        success: "bg-green-500 text-white hover:bg-green-600",
      },
      size: {
        default: "h-8 px-3",
        sm: "h-7 px-2 text-xs",
        lg: "h-9 px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface CopyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof copyButtonVariants> {
  asChild?: boolean;
  contentToCopy: string;
}

const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
  (
    { className, variant, size, asChild = false, contentToCopy, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(contentToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    };

    return (
      <Comp
        className={cn(copyButtonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleCopy}
        {...props}
      >
        {copied ? (
          <CheckIcon className="w-4 h-4" />
        ) : (
          <ClipboardIcon className="w-4 h-4" />
        )}
        {copied ? "Copied" : "Copy"}
      </Comp>
    );
  },
);
CopyButton.displayName = "CopyButton";

export { CopyButton, copyButtonVariants };
