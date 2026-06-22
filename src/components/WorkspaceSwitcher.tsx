"use client";

import { RiAddCircleFill } from "react-icons/ri";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/modules/workspaces/hooks/use-workspace-id";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useCreateWorkspaceModal } from "@/modules/workspaces/hooks/use-create-workspace-modal";

import useGetRole from "@/modules/workspaces/api/use-get-role";

export const WorkspaceSwitcher = () => {
  const trpc = useTRPC();
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const { data: workspaces } = useQuery(trpc.workspaces.getMany.queryOptions());
  const roleQuery = useGetRole({ workspaceId: workspaceId });
  const { open } = useCreateWorkspaceModal();

  const onSelect = (id: string) => {
    router.push(`/dashboard/workspaces/${id}`);
  };

  const isClient = roleQuery.data?.isClient ?? false;

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-500 uppercase">Workspaces</p>
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
      <Select onValueChange={onSelect} value={workspaceId}>
        <SelectTrigger className="w-full bg-neutral-200 p-1 font-medium">
          <SelectValue placeholder="No workspace selected" />
        </SelectTrigger>
        <SelectContent>
          {workspaces?.map((workspace) => (
            <SelectItem key={workspace.id} value={workspace.id}>
              <div className="flex items-center justify-start gap-3 font-medium">
                <span className="truncate pl-2 font-semibold">
                  {workspace.name}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
