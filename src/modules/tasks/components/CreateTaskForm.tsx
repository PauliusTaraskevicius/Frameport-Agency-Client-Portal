"use client";

import { useWorkspaceId } from "@/modules/workspaces/hooks/use-workspace-id";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DottedSeparator } from "@/components/DottedSeparator";
import { cn, formatStatus } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTask } from "../api/use-create-task";
import { createTaskSchema } from "../schema";
import { DatePicker } from "@/components/DatePicker";
import { TaskStatus } from "../types";
import { ProjectAvatar } from "@/modules/projects/ui/components/ProjectAvatar";

interface CreateTaskFormProps {
  onCancel?: () => void;
  projectOptions: { id: string; name: string }[];
  memberOptions: { id: string; name: string }[];
}

export const CreateTaskForm = ({
  onCancel,
  projectOptions,
  memberOptions,
}: CreateTaskFormProps) => {
  const workspaceId = useWorkspaceId();
  const trpc = useTRPC();

  const form = useForm({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      workspaceId,
      title: "",
      description: "",
      status: TaskStatus.TODO,
      projectId: "",
      assigneeId: "",
      dueDate: undefined,
    },
  });

  const getTasks = useQuery(trpc.tasks.getMany.queryOptions({ workspaceId }));

  const clientsQuery = useQuery(
    trpc.clients.getMany.queryOptions({
      workspaceId,
    }),
  );

  const createTaskMutation = useCreateTask(workspaceId);

  const isPending = createTaskMutation.isPending;

  const onSubmit = (data: z.infer<typeof createTaskSchema>) => {
    form.reset();
    createTaskMutation.mutate({
      ...data,
      projectId: data.projectId,
    });
  };

  return (
    <Card className="h-full w-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">Create a new Task</CardTitle>
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
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value as Date | undefined}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                      </FormControl>
                      <FormMessage />
                      <SelectContent>
                        {memberOptions.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center gap-x-2">
                              {member.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <FormMessage />
                      <SelectContent>
                        <SelectItem value={TaskStatus.TODO}>
                          {formatStatus(TaskStatus.TODO)}
                        </SelectItem>
                        <SelectItem value={TaskStatus.IN_PROGRESS}>
                          {formatStatus(TaskStatus.IN_PROGRESS)}
                        </SelectItem>
                        <SelectItem value={TaskStatus.REVIEW}>
                          {formatStatus(TaskStatus.REVIEW)}
                        </SelectItem>
                        <SelectItem value={TaskStatus.DONE}>
                          {formatStatus(TaskStatus.DONE)}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <FormMessage />
                      <SelectContent>
                        {projectOptions.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            <div className="flex items-center gap-x-2">
                              <ProjectAvatar
                                className="size-6"
                                name={project.name}
                              />
                              {project.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter task description"
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
                disabled={isPending}
                className={cn(!onCancel && "invisible")}
              >
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={isPending}>
                Create Task
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
