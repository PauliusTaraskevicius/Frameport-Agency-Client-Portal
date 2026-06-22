"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";
import { Workspace } from "@/generated/prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import z from "zod";
import { updateWorkspaceSchema } from "../../schema";
import { DottedSeparator } from "@/components/DottedSeparator";
import { ArrowLeft, CopyIcon, RefreshCw, Ban } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { MemberRole } from "@/modules/members/types";
import { useUpdateWorkspace } from "../../api/use-update-workspace";
import { useDeleteWorkspace } from "../../api/use-delete-workspace";
import { useResetInvitation } from "@/modules/invitations/api/use-reset-invitation";
import { useRevokeInvitation } from "@/modules/invitations/api/use-revoke-invitation";

interface UpdateWorkspaceFormProps {
  onCancel?: () => void;
  initialValues: Workspace;
}

export const UpdateWorkspaceForm = ({
  onCancel,
  initialValues,
}: UpdateWorkspaceFormProps) => {
  const router = useRouter();
  const trpc = useTRPC();
  const { userId } = useAuth();

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Workspace",
    "This action cannot be undone",
  );

  const [ResetDialog, confirmReset] = useConfirm(
    "Reset Invite Link",
    "This will invalidate the current link and send a new one. Continue?",
  );

  const [RevokeDialog, confirmRevoke] = useConfirm(
    "Revoke Invite Link",
    "This will cancel the current invitation and invalidate the link. Continue?",
  );

  const { data: members } = useQuery(
    trpc.members.getMany.queryOptions({ workspaceId: initialValues.id }),
  );

  const currentMember = members?.find((member) => member.userId === userId);
  const isOwner = currentMember?.role === MemberRole.OWNER;

  const form = useForm<z.infer<typeof updateWorkspaceSchema>>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      ...initialValues,
    },
  });

  const updateWorkspaceMutation = useUpdateWorkspace();
  const deleteWorkspaceMutation = useDeleteWorkspace();
  const resetInvitationMutation = useResetInvitation({ id: initialValues.id });
  const revokeInvitationMutation = useRevokeInvitation({
    id: initialValues.id,
  });

  const pendingInvitations = useQuery(
    trpc.invitations.getByWorkspace.queryOptions({
      workspaceId: initialValues.id,
    }),
  );

  const handleCancelInvitation = async (token: string) => {
    const ok = await confirmRevoke();
    if (!ok) return;
    revokeInvitationMutation.mutate({ token });
  };

  const handleResetInvitation = async (token: string) => {
    const ok = await confirmReset();
    if (!ok) return;
    resetInvitationMutation.mutate({ token });
  };

  const handleCopyInviteLink = (token: string) => {
    const link = `${window.location.origin}/dashboard/workspaces/${initialValues.id}/join/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied to clipboard");
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete();

    if (!ok) return;

    deleteWorkspaceMutation.mutate({ id });
  };

  const onSubmit = async (values: z.infer<typeof updateWorkspaceSchema>) => {
    await updateWorkspaceMutation.mutateAsync(values);
  };

  return (
    <div className="flex flex-col gap-y-4">
      <DeleteDialog />
      <ResetDialog />
      <RevokeDialog />
      <Card className="h-full w-full border-none shadow-none">
        <CardHeader className="flex flex-row items-center space-y-0 gap-x-4 p-7">
          <Button
            className="cursor-pointer"
            size="sm"
            variant="secondary"
            onClick={
              onCancel
                ? onCancel
                : () => router.push(`/dashboard/workspaces/${initialValues.id}`)
            }
          >
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>
          <CardTitle className="text-xl font-bold">
            {initialValues.name}
          </CardTitle>
        </CardHeader>
        <div className="px-7">
          <DottedSeparator />
        </div>
        <CardContent className="p-7">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workspace name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter workspace name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DottedSeparator className="py-7" />
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  size="lg"
                  variant="secondary"
                  onClick={onCancel}
                  disabled={updateWorkspaceMutation.isPending}
                  className={cn(!onCancel && "invisible")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  variant="default"
                  disabled={updateWorkspaceMutation.isPending || !isOwner}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      {isOwner && (
        <Card className="h-full w-full border-none shadow-none">
          <CardContent className="p-7">
            <div className="flex flex-col">
              <h3 className="font-bold">Pending Invitations</h3>
              <p className="text-muted-foreground text-sm">
                Manage pending invitations for this workspace
              </p>
              <DottedSeparator className="py-4" />
              {pendingInvitations.isLoading && (
                <p className="text-muted-foreground text-sm">Loading...</p>
              )}
              {pendingInvitations.data?.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No pending invitations
                </p>
              )}

              {pendingInvitations.data?.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between py-2"
                >
                  <span className="text-sm">{invitation.email}</span>
                  <div className="flex items-center gap-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleCopyInviteLink(invitation.token)}
                    >
                      <CopyIcon className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      disabled={resetInvitationMutation.isPending}
                      onClick={() => handleResetInvitation(invitation.token)}
                    >
                      <RefreshCw className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      disabled={revokeInvitationMutation.isPending}
                      onClick={() => handleCancelInvitation(invitation.token)}
                    >
                      <Ban className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="h-full w-full border-none shadow-none">
        <CardContent className="p-7">
          <div className="flex flex-col">
            <h3 className="font-bold">Danger Zone</h3>
            <p className="text-muted-foreground text-sm">
              Deleting a workspace is a irreversible and will remove all
              associated data
            </p>
            <DottedSeparator className="py-7" />
            <Button
              className="mt-6 ml-auto w-fit"
              size="sm"
              variant="destructive"
              type="button"
              disabled={
                deleteWorkspaceMutation.isPending ||
                updateWorkspaceMutation.isPending ||
                !isOwner
              }
              onClick={() => handleDelete(initialValues.id)}
            >
              Delete Workspace
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
