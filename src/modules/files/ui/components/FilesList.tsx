"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

import { useDeleteFile } from "../../api/use-delete-file";

import { useConfirm } from "@/hooks/use-confirm";

import { FileItem } from "./FileItem";

interface FilesListProps {
  projectId: string;
}

export const FilesList = ({ projectId }: FilesListProps) => {
  const trpc = useTRPC();

  const { data: files } = useQuery(
    trpc.files.getMany.queryOptions({ projectId }),
  );

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete File",
    "This action cannot be undone.",
  );

  const deleteFileMutation = useDeleteFile({ projectId });

  const handleDelete = async (fileId: string) => {
    const ok = await confirmDelete();

    if (!ok) return;

    deleteFileMutation.mutate({ fileId });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
      <DeleteDialog />
      {files?.map((file) => (
        <FileItem
          key={file.id}
          file={file}
          projectId={projectId}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};
