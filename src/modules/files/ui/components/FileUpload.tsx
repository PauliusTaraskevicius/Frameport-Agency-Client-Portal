"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  UploadCloud,
  X,
  FileIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetPresignedUrls } from "../../api/use-get-presigned-urls";
import { useSaveFiles } from "../../api/use-save-files";

interface FileItem {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
}

interface FileUploadProps {
  projectId: string;
  onSuccess?: () => void;
}

export const FileUpload = ({ projectId, onSuccess }: FileUploadProps) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const getPresignedUrls = useGetPresignedUrls();

  const saveFiles = useSaveFiles();

  const onDrop = useCallback(
    (accepted: File[]) => {
      const remaining = 10 - files.length;
      setFiles((prev) => [
        ...prev,
        ...accepted.slice(0, remaining).map((f) => ({
          file: f,
          progress: 0,
          status: "pending" as const,
        })),
      ]);
    },
    [files.length],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: files.length >= 10,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadAll = async () => {
    const pending = files.filter((f) => f.status === "pending");
    if (!pending.length) return;

    // Step 1: Get presigned URLs
    let presigned: {
      key: string;
      presignedUrl: string;
      publicUrl: string;
    }[];

    try {
      presigned = await getPresignedUrls.mutateAsync({
        projectId,
        files: pending.map((f) => ({
          name: f.file.name,
          mimeType: f.file.type,
        })),
      });
    } catch (error) {
      toast.error("Failed to get upload URLs");
      return;
    }

    // Step 2: upload each file to S3 directly via XHR (enables progress tracking)
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
                setFiles((prev) =>
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
                setFiles((prev) =>
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
                setFiles((prev) =>
                  prev.map((f) =>
                    f.file === item.file ? { ...f, status: "error" } : f,
                  ),
                );
              }
              resolve();
            });

            xhr.open("PUT", presignedUrl);
            xhr.setRequestHeader("Content-Type", item.file.type);
            xhr.send(item.file);
          }),
      ),
    );

    // Step 3: save metadata to DB
    if (uploaded.length) {
      try {
        await saveFiles.mutateAsync({ projectId, files: uploaded });
        await queryClient.invalidateQueries({
          queryKey: trpc.files.getMany.queryOptions({ projectId }).queryKey,
        });
        toast.success(`${uploaded.length} file(s) uploaded`);
        setFiles((prev) => prev.filter((f) => f.status !== "done"));
        onSuccess?.();
      } catch {
        toast.error(
          "Files uploaded but failed to save records. Please contact support.",
        );
      }
    }
  };

  const isUploading =
    getPresignedUrls.isPending ||
    saveFiles.isPending ||
    files.some((f) => f.status === "uploading");
  const hasPending = files.some((f) => f.status === "pending");

  return (
    <div className="flex flex-col gap-4">
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          files.length >= 10 && "pointer-events-none opacity-50",
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="text-muted-foreground mb-2 h-8 w-8" />
        <p className="text-sm font-medium">
          {isDragActive
            ? "Drop files here..."
            : "Drag & drop or click to select"}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          {files.length}/10 files selected
        </p>
      </div>

      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((item, i) => (
            <li key={i} className="flex flex-col gap-2 rounded-md border p-3">
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
                {item.status === "pending" && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 shrink-0"
                    onClick={() => removeFile(i)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {hasPending && (
        <Button onClick={uploadAll} disabled={isUploading}>
          {isUploading
            ? "Uploading..."
            : `Upload ${files.filter((f) => f.status === "pending").length} file(s)`}
        </Button>
      )}
    </div>
  );
};
