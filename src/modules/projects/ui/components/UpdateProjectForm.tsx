"use client";

import { z } from "zod";

import { ArrowLeftIcon } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useConfirm } from "@/hooks/use-confirm";

import { updateProjectSchema } from "../../schema";
import { useUpdateProject } from "../../api/use-update-project";
import { useDeleteProject } from "../../api/use-delete-project";
import { DottedSeparator } from "@/components/DottedSeparator";
import { Project } from "@/generated/prisma/client";
import { Textarea } from "@/components/ui/textarea";
import useGetRole from "@/modules/workspaces/api/use-get-role";
import { useWorkspaceId } from "@/modules/workspaces/hooks/use-workspace-id";

interface UpdateProjectFormProps {
  onCancel?: () => void;
  initialValues: Project;
}

export const UpdateProjectForm = ({
  onCancel,
  initialValues,
}: UpdateProjectFormProps) => {
  const router = useRouter();

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Project",
    "This action cannot be undone.",
  );

  const form = useForm<z.infer<typeof updateProjectSchema>>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      id: initialValues.id,
      name: initialValues.name,
      description: initialValues.description ?? undefined,
    },
  });

  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject({
    workspaceId: initialValues.workspaceId,
  });

  const workspaceId = useWorkspaceId();
  const roleQuery = useGetRole({ workspaceId: workspaceId });

  const handleDelete = async () => {
    const ok = await confirmDelete();

    if (!ok) return;

    deleteProjectMutation.mutate({ projectId: initialValues.id });
  };

  const onSubmit = async (values: z.infer<typeof updateProjectSchema>) => {
    await updateProjectMutation.mutateAsync({
      projectId: initialValues.id,
      ...values,
    });
  };

  const isClient = roleQuery.data?.isClient ?? false;

  return (
    <div className="flex flex-col gap-y-4">
      <DeleteDialog />
      <Card className="h-full w-full border-none shadow-none">
        <CardHeader className="flex flex-row items-center space-y-0 gap-x-4 p-7">
          <Button
            className="cursor-pointer"
            size="sm"
            variant="secondary"
            onClick={
              onCancel
                ? onCancel
                : () =>
                    router.push(
                      `/dashboard/workspaces/${initialValues.workspaceId}/projects/${initialValues.id}`,
                    )
            }
          >
            <ArrowLeftIcon className="size-4" />
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
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter project description"
                          {...field}
                        />
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
                  disabled={updateProjectMutation.isPending}
                  className={cn(!onCancel && "invisible cursor-pointer")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  disabled={updateProjectMutation.isPending || isClient}
                  className="cursor-pointer"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card className="h-full w-full border-none shadow-none">
        <CardContent className="p-7">
          <div className="flex flex-col">
            <h3 className="font-bold">Danger Zone</h3>
            <p className="text-muted-foreground text-sm">
              Deleting a project is a irreversible and will remove all
              associated data.
            </p>
            <DottedSeparator className="py-7" />
            <Button
              className="mt-6 ml-auto w-fit"
              size="sm"
              variant="destructive"
              type="button"
              disabled={
                updateProjectMutation.isPending ||
                deleteProjectMutation.isPending ||
                isClient
              }
              onClick={handleDelete}
            >
              Delete Project
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
