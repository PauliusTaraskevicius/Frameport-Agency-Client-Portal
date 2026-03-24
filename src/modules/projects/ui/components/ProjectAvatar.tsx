import Image from "next/image";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProjectAvatarProps {
  name: string;
  className?: string;
  fallbackClassName?: string;
}

export const ProjectAvatar = ({
  name,
  className,
  fallbackClassName,
}: ProjectAvatarProps) => {
  return (
    <Avatar className={cn("size-5 rounded-md", className)}>
      <AvatarFallback
        className={cn(
          "rounded-md bg-blue-600 text-sm font-semibold text-white uppercase",
          fallbackClassName,
        )}
      >
        {name[0]}
      </AvatarFallback>
    </Avatar>
  );
};
