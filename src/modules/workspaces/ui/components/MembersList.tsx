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
import { useQuery } from "@tanstack/react-query";
import { DottedSeparator } from "@/components/DottedSeparator";
import { MemberRole } from "@/modules/members/types";

import { useAuth } from "@clerk/nextjs";
import { useUpdateMember } from "@/modules/members/api/use-update-member";
import { useDeleteMember } from "@/modules/members/api/use-delete-member";

export const MembersList = () => {
  const workspaceId = useWorkspaceId();
  const { userId } = useAuth();
  const trpc = useTRPC();
  const [ConfirmDialog, confirmDelete] = useConfirm(
    "Remove member",
    "This member will be removed from the workspace.",
  );

  const { data: members } = useQuery(
    trpc.members.getMany.queryOptions({ workspaceId }),
  );

  const currentMember = members?.find((member) => member.userId === userId);
  const isOwner = currentMember?.role === MemberRole.OWNER;
  const isAdmin = currentMember?.role === MemberRole.ADMIN;

  const updateMemberMutation = useUpdateMember(workspaceId);
  const deleteMemberMutation = useDeleteMember(workspaceId);

  const handleUpdateMember = async (
    userId: string,
    role: MemberRole.OWNER | MemberRole.ADMIN | MemberRole.MEMBER | MemberRole.CLIENT,
  ) => {
    updateMemberMutation.mutate({ workspaceId, userId, role });
  };

  const handleDeleteMember = async (userId: string) => {
    const ok = await confirmDelete();
    if (!ok) return;

    deleteMemberMutation.mutate({ workspaceId, userId });
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
                  {member.role}
                </p>
              </div>

              {(isOwner || isAdmin) && (
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
                          handleUpdateMember(member.userId, MemberRole.ADMIN)
                        }
                        disabled={updateMemberMutation.isPending}
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
                        disabled={updateMemberMutation.isPending}
                      >
                        Set as Member
                      </DropdownMenuItem>
                    )}

                    {member.role !== MemberRole.CLIENT && (
                      <DropdownMenuItem
                        className="font-medium"
                        onClick={() =>
                          handleUpdateMember(member.userId, MemberRole.CLIENT)
                        }
                        disabled={updateMemberMutation.isPending}
                      >
                        Set as Client
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      className="font-medium text-amber-700"
                      onClick={() => handleDeleteMember(member.userId)}
                      disabled={deleteMemberMutation.isPending}
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
