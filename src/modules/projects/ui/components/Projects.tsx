"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiAddCircleFill } from "react-icons/ri";
import { cn } from "@/lib/utils";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useWorkspaceId } from "@/modules/workspaces/hooks/use-workspace-id";
import { ProjectAvatar } from "./ProjectAvatar";
import { useCreateProjectModal } from "../../hooks/use-create-project-modal";
import useGetRole from "@/modules/workspaces/api/use-get-role";
import { Button } from "@/components/ui/button";

export const Projects = () => {
  const trpc = useTRPC();
  const { open } = useCreateProjectModal();
  const pathname = usePathname();
  const workspaceId = useWorkspaceId();
  const roleQuery = useGetRole({ workspaceId: workspaceId });
  const { data: projects } = useQuery(
    trpc.projects.getMany.queryOptions({ workspaceId }),
  );

  const isClient = roleQuery.data?.isClient ?? false;

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-500 uppercase">Projects</p>
        <Button
          disabled={isClient}
          variant="ghost"
          size="icon"
          onClick={isClient ? undefined : open}
          className="cursor-pointer"
        >
          <RiAddCircleFill className="size-5 cursor-pointer text-neutral-500 transition hover:opacity-75" />
        </Button>
      </div>
      {projects?.map((project) => {
        const href = `/dashboard/workspaces/${workspaceId}/projects/${project.id}`;
        const isActive = pathname === href;

        return (
          <Link key={project.id} href={href}>
            <div
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-md p-2.5 text-neutral-500 transition hover:opacity-75",
                isActive && "text-primary bg-white shadow-sm hover:opacity-100",
              )}
            >
              <ProjectAvatar name={project.name} />
              <span className="truncate">{project.name}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
