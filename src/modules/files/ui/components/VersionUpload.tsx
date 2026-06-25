"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  UploadCloud,
  FileIcon,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetPresignedUrls } from "../../api/use-get-presigned-urls";
import { useAddVersion } from "../../api/use-add-version";

interface FileItem {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
}

interface VersionUploadProps {
  fileId: string;
  projectId: string;
  onSuccess?: () => void;
}

export const VersionUpload = ({
  fileId,
  projectId,
  onSuccess,
}: VersionUploadProps) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const getPresignedUrls = useGetPresignedUrls();
  const addVersion = useAddVersion();

  const onDrop = useCallback((accepted: File[]) => {
    // only one file at a time for a revision
    setFiles([{ file: accepted[0], progress: 0, status: "pending" }]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 1024 * 1024 * 5,
    accept: { "image/*": [], "application/pdf": [] },
  });

  const upload = async () => {
    const item = files[0];
    if (!item || item.status !== "pending") return;

    let presigned: { key: string; presignedUrl: string; publicUrl: string }[];
    try {
      presigned = await getPresignedUrls.mutateAsync({
        projectId,
        files: [{ name: item.file.name, mimeType: item.file.type }],
      });
    } catch {
      toast.error("Failed to get upload URL");
      return;
    }

    const { key, presignedUrl, publicUrl } = presigned[0];

    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setFiles([{ ...item, progress: pct, status: "uploading" }]);
        }
      });
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setFiles([{ ...item, progress: 100, status: "done" }]);
        } else {
          setFiles([{ ...item, status: "error" }]);
        }
        resolve();
      });
      xhr.open("PUT", presignedUrl);
      xhr.setRequestHeader("Content-Type", item.file.type);
      xhr.send(item.file);
    });

    try {
      await addVersion.mutateAsync({
        fileId,
        key,
        url: publicUrl,
        mimeType: item.file.type,
        size: item.file.size,
      });
      toast.success("New version uploaded");
      setFiles([]);
      onSuccess?.();
    } catch {
      toast.error("Upload succeeded but failed to save version.");
    }
  };

  const isUploading =
    getPresignedUrls.isPending ||
    addVersion.isPending ||
    files[0]?.status === "uploading";

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">Upload revised version</p>
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="text-muted-foreground mb-2 h-6 w-6" />
        <p className="text-sm">
          {isDragActive
            ? "Drop file here..."
            : "Drag & drop or click to select"}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          Images or PDF, max 5MB
        </p>
      </div>

      {files[0] && (
        <div className="flex flex-col gap-2 rounded-md border p-3">
          <div className="flex items-center gap-2">
            <FileIcon className="text-muted-foreground h-4 w-4 shrink-0" />
            <span className="flex-1 truncate text-sm">
              {files[0].file.name}
            </span>
            {files[0].status === "done" && (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            {files[0].status === "error" && (
              <AlertCircle className="text-destructive h-4 w-4" />
            )}
            {files[0].status === "pending" && (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => setFiles([])}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          {(files[0].status === "uploading" || files[0].status === "done") && (
            <Progress value={files[0].progress} className="h-1.5" />
          )}
        </div>
      )}

      {files[0]?.status === "pending" && (
        <Button onClick={upload} disabled={isUploading} size="sm">
          {isUploading ? "Uploading..." : "Upload Revision"}
        </Button>
      )}
    </div>
  );
};
