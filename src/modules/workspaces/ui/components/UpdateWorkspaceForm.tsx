"use client";

import { useRef } from "react";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import z from "zod";
import { updateWorkspaceSchema } from "../../schema";
import { DottedSeparator } from "@/components/DottedSeparator";
import { ArrowLeft } from "lucide-react";

interface UpdateWorkspaceFormProps {
  onCancel?: () => void;
  initialValues: Workspace;
}

export const UpdateWorkspaceForm = ({
  onCancel,
  initialValues,
}: UpdateWorkspaceFormProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Workspace",
    "This action cannot be undone",
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof updateWorkspaceSchema>>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      ...initialValues,
    },
  });

  const updateWorkspace = useMutation(
    trpc.workspaces.update.mutationOptions({
      onSuccess: (data) => {
        form.reset();
        queryClient.invalidateQueries(trpc.workspaces.getMany.queryOptions());
        toast.success("Workspace updated successfully");
        router.push(`/dashboard/workspaces/${data.id}`);
      },
      onError: (error) => {
        toast.error(
          error.message || "An error occurred while updating the workspace",
        );
      },
    }),
  );

  const deleteWorkspace = useMutation(
    trpc.workspaces.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Workspace deleted successfully");
        queryClient.invalidateQueries(trpc.workspaces.getMany.queryOptions());
        router.push("/dashboard");
      },
      onError: (error) => {
        toast.error(
          error.message || "An error occurred while deleting the workspace",
        );
      },
    }),
  );

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete();

    if (!ok) return;

    deleteWorkspace.mutate({ id });
  };

  const onSubmit = async (values: z.infer<typeof updateWorkspaceSchema>) => {
    await updateWorkspace.mutateAsync(values);
  };

  return (
    <div className="flex flex-col gap-y-4">
      <DeleteDialog />
      {/* <ResetDialog /> */}
      <Card className="h-full w-full border-none shadow-none">
        <CardHeader className="flex flex-row items-center space-y-0 gap-x-4 p-7">
          <Button
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
                  disabled={updateWorkspace.isPending}
                  className={cn(!onCancel && "invisible")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  variant="default"
                  disabled={updateWorkspace.isPending}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* <Card className="h-full w-full border-none shadow-none">
        <CardContent className="p-7">
          <div className="flex flex-col">
            <h3 className="font-bold">Invite members</h3>
            <p className="text-muted-foreground text-sm">
              Use the invite link to add members to your workspace
            </p>
            <div className="mt-4">
              <div className="flex items-center gap-x-2">
                <Input disabled value={fullInviteLink} />
                <Button
                  onClick={handleCopyInviteLink}
                  variant="secondary"
                  className="size-12"
                >
                  <CopyIcon className="size-5" />
                </Button>
              </div>
            </div>
            <DottedSeparator className="py-7" />
            <Button
              className="mt-6 ml-auto w-fit"
              size="sm"
              variant="destructive"
              type="button"
              disabled={isPending || isResetingInviteCode}
              onClick={handleResetInviteCode}
            >
              Reset invite link
            </Button>
          </div>
        </CardContent>
      </Card> */}

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
              disabled={deleteWorkspace.isPending || updateWorkspace.isPending}
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
