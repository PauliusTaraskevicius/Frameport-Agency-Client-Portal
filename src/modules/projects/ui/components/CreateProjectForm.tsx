"use client";

import { useWorkspaceId } from "@/modules/workspaces/hooks/use-workspace-id";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { createProjectSchema } from "../../schema";

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
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useCreateProject } from "../../api/use-create-project";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle,
  FileIcon,
  UploadCloud,
  X,
} from "lucide-react";

interface FileItem {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
}

interface CreateProjectFormProps {
  onCancel?: () => void;
}

export const CreateProjectForm = ({ onCancel }: CreateProjectFormProps) => {
  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      clientId: "",
    },
  });

  const clientsQuery = useQuery(
    trpc.clients.getMany.queryOptions({ workspaceId }),
  );

  const createProjectMutation = useCreateProject(workspaceId);
  const getPresignedUrls = useMutation(
    trpc.files.getPresignedUrls.mutationOptions(),
  );
  const saveFiles = useMutation(trpc.files.saveFiles.mutationOptions());

  const onDrop = useCallback(
    (accepted: File[]) => {
      const remaining = 10 - fileItems.length;
      setFileItems((prev) => [
        ...prev,
        ...accepted.slice(0, remaining).map((f) => ({
          file: f,
          progress: 0,
          status: "pending" as const,
        })),
      ]);
    },
    [fileItems.length],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: fileItems.length >= 10,
  });

  const removeFile = (index: number) =>
    setFileItems((prev) => prev.filter((_, i) => i !== index));

  const isUploading =
    createProjectMutation.isPending ||
    getPresignedUrls.isPending ||
    saveFiles.isPending ||
    fileItems.some((f) => f.status === "uploading");

  const onSubmit = async (data: z.infer<typeof createProjectSchema>) => {
    // Step 1: create the project
    let projectId: string;
    try {
      const project = await createProjectMutation.mutateAsync({
        ...data,
        workspaceId,
      });
      projectId = project.id;
    } catch {
      return;
    }

    const pending = fileItems.filter((f) => f.status === "pending");

    // Step 2: if files were selected, upload them
    if (pending.length > 0) {
      let presigned: { key: string; presignedUrl: string; publicUrl: string }[];
      try {
        presigned = await getPresignedUrls.mutateAsync({
          projectId,
          files: pending.map((f) => ({
            name: f.file.name,
            mimeType: f.file.type,
          })),
        });
      } catch {
        toast.error("Project created but failed to prepare file upload");
        router.push(
          `/dashboard/workspaces/${workspaceId}/projects/${projectId}`,
        );
        return;
      }

      const uploaded: {
        name: string;
        key: string;
        url: string;
        mimeType?: string;
        size: number;
      }[] = [];

      await Promise.all(
        pending.map(
          (item, i) =>
            new Promise<void>((resolve) => {
              const { key, presignedUrl, publicUrl } = presigned[i];
              const xhr = new XMLHttpRequest();

              xhr.upload.addEventListener("progress", (e) => {
                if (e.lengthComputable) {
                  const pct = Math.round((e.loaded / e.total) * 100);
                  setFileItems((prev) =>
                    prev.map((f) =>
                      f.file === item.file
                        ? { ...f, progress: pct, status: "uploading" }
                        : f,
                    ),
                  );
                }
              });

              xhr.addEventListener("load", () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  setFileItems((prev) =>
                    prev.map((f) =>
                      f.file === item.file
                        ? { ...f, progress: 100, status: "done" }
                        : f,
                    ),
                  );
                  uploaded.push({
                    name: item.file.name,
                    key,
                    url: publicUrl,
                    mimeType: item.file.type,
                    size: item.file.size,
                  });
                } else {
                  setFileItems((prev) =>
                    prev.map((f) =>
                      f.file === item.file ? { ...f, status: "error" } : f,
                    ),
                  );
                }
                resolve();
              });

              xhr.addEventListener("error", () => {
                setFileItems((prev) =>
                  prev.map((f) =>
                    f.file === item.file ? { ...f, status: "error" } : f,
                  ),
                );
                resolve();
              });

              xhr.open("PUT", presignedUrl);
              xhr.setRequestHeader("Content-Type", item.file.type);
              xhr.send(item.file);
            }),
        ),
      );

      if (uploaded.length > 0) {
        try {
          await saveFiles.mutateAsync({ projectId, files: uploaded });
          await queryClient.invalidateQueries({
            queryKey: trpc.files.getMany.queryOptions({ projectId }).queryKey,
          });
        } catch {
          toast.error("Files uploaded but failed to save records");
        }
      }
    }

    router.push(`/dashboard/workspaces/${workspaceId}/projects/${projectId}`);
  };

  return (
    <Card className="h-full w-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">
          Create a new project
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

              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clientsQuery.data?.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium">
                  Files{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </p>
                <div
                  {...getRootProps()}
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors",
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50",
                    fileItems.length >= 10 && "pointer-events-none opacity-50",
                    isUploading && "pointer-events-none opacity-50",
                  )}
                >
                  <input {...getInputProps()} />
                  <UploadCloud className="text-muted-foreground mb-2 h-7 w-7" />
                  <p className="text-sm font-medium">
                    {isDragActive
                      ? "Drop files here..."
                      : "Drag & drop or click to select"}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {fileItems.length}/10 files
                  </p>
                </div>

                {fileItems.length > 0 && (
                  <ul className="flex flex-col gap-2">
                    {fileItems.map((item, i) => (
                      <li
                        key={i}
                        className="flex flex-col gap-2 rounded-md border p-3"
                      >
                        <div className="flex items-center gap-2">
                          <FileIcon className="text-muted-foreground h-4 w-4 shrink-0" />
                          <span className="min-w-0 flex-1 truncate text-sm">
                            {item.file.name}
                          </span>
                          {item.status === "done" && (
                            <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
                          )}
                          {item.status === "error" && (
                            <AlertCircle className="text-destructive h-4 w-4 shrink-0" />
                          )}
                          {item.status === "pending" && !isUploading && (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 shrink-0"
                              onClick={() => removeFile(i)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        {(item.status === "uploading" ||
                          item.status === "done") && (
                          <Progress value={item.progress} className="h-1.5" />
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <DottedSeparator className="py-7" />
            <div className="flex items-center justify-between">
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={onCancel}
                disabled={isUploading}
                className={cn(!onCancel && "invisible")}
              >
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={isUploading}>
                {isUploading ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
