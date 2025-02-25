import React from "react";
import { cn } from "@/utils/cn";

interface ClickableListItemProps {
  children: React.ReactNode;
  onClick?: () => void;
}

const ClickableListItem: React.FC<ClickableListItemProps> = ({
  children,
  onClick,
}) => {
  return (
    <li
      className={cn(
        "cursor-pointer bg-gray-100 dark:bg-gray-800 rounded-md transition-colors",
        "hover:bg-gray-300 dark:hover:bg-gray-600",
      )}
      onClick={() => onClick && onClick()}
    >
      {typeof children === "string"
        ? children.replace(/\n{3,}/g, "\n\n").trim()
        : children}
    </li>
  );
};

export { ClickableListItem };
