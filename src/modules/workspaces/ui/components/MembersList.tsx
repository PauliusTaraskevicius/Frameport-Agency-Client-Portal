"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, MoreVerticalIcon } from "lucide-react";
import Link from "next/link";

import { Fragment } from "react";

import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspaceId } from "../../hooks/use-workspace-id";
import { useConfirm } from "@/hooks/use-confirm";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DottedSeparator } from "@/components/DottedSeparator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateMemberSchema } from "@/modules/members/schema";
import { MemberRole } from "@/modules/members/types";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";



export const MembersList = () => {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const trpc = useTRPC();
  const [ConfirmDialog, confirmDelete] = useConfirm(
    "Remove member",
    "This member will be removed from the workspace.",
  );

  const { data: members, isLoading: isLoadingMembers } = useQuery(
    trpc.members.getMany.queryOptions({ workspaceId }),
  );

  const currentMember = members?.find((member) => member.userId === userId);
  const isOwner = currentMember?.role === MemberRole.OWNER;

  const form = useForm({
    resolver: zodResolver(updateMemberSchema),
    defaultValues: {
      id: "",
      role: "" as MemberRole,
    },
  });

  const updateMember = useMutation(
    trpc.members.update.mutationOptions({
      onSuccess: () => {
        form.reset;
        queryClient.invalidateQueries(
          trpc.members.getMany.queryOptions({ workspaceId }),
        );
        toast.success("Member role updated successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update member role");
      },
    }),
  );

  const deleteMember = useMutation(
    trpc.members.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.members.getMany.queryOptions({ workspaceId }),
        );
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete member");
      },
    }),
  );

  const handleUpdateMember = async (userId: string, role: MemberRole) => {
    updateMember.mutate({ workspaceId, userId, role });
  };

  const handleDeleteMember = async (userId: string) => {
    const ok = await confirmDelete();
    if (!ok) return;

    deleteMember.mutate({ workspaceId, userId });
  };

  return (
    <Card className="h-full w-full border-none shadow-none">
      <ConfirmDialog />
      <CardHeader className="flex flex-row items-center space-y-0 gap-x-4 p-7">
        <Button variant="secondary" size="sm" asChild>
          <Link href={`/dashboard/workspaces/${workspaceId}`}>
            <ArrowLeftIcon className="mr-2 size-4" />
            Back
          </Link>
        </Button>
        <CardTitle className="text-xl font-bold">Members List</CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        {members?.map((member, index) => (
          <Fragment key={member.id}>
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <p className="text-sm font-medium">{member.user.firstName}</p>
                <p className="text-muted-foreground text-xs">
                  {member.user.email}
                </p>
              </div>

              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="ml-auto" variant="secondary" size="sm">
                      <MoreVerticalIcon className="text-muted-foreground size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="bottom" align="end">
                    {member.role !== MemberRole.OWNER && (
                      <DropdownMenuItem
                        className="font-medium"
                        onClick={() =>
                          handleUpdateMember(member.userId, MemberRole.OWNER)
                        }
                        disabled={updateMember.isPending}
                      >
                        Set as Administrator
                      </DropdownMenuItem>
                    )}

                    {member.role !== MemberRole.MEMBER && (
                      <DropdownMenuItem
                        className="font-medium"
                        onClick={() =>
                          handleUpdateMember(member.userId, MemberRole.MEMBER)
                        }
                        disabled={updateMember.isPending}
                      >
                        Set as Member
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      className="font-medium text-amber-700"
                      onClick={() => handleDeleteMember(member.userId)}
                      disabled={deleteMember.isPending}
                    >
                      Remove {member.user.firstName}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            {index < members.length - 1 && <Separator className="my-2.5" />}
          </Fragment>
        ))}
      </CardContent>
    </Card>
  );
};
