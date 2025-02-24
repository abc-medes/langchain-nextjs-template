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
        "mb-1 cursor-pointer bg-gray-100 dark:bg-gray-800 rounded-md p-1 transition-colors",
        "hover:bg-gray-300 dark:hover:bg-gray-600",
      )}
      onClick={() => onClick && onClick()}
    >
      {children}
    </li>
  );
};

export { ClickableListItem };
