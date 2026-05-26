"use client";

import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

import Image from "next/image";
import { AiOutlineFilePdf } from "react-icons/ai";
import { useDeleteFile } from "../../api/use-delete-file";
import { Button } from "@/components/ui/button";
import { Trash2Icon, TrashIcon } from "lucide-react";
import { useConfirm } from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/modules/workspaces/hooks/use-workspace-id";

interface FilesListProps {
  projectId: string;
}

export const FilesList = ({ projectId }: FilesListProps) => {
  const trpc = useTRPC();
  const workspaceId = useWorkspaceId();

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
        <div key={file.id} className="w-full sm:w-64">
          <div className="bg-muted flex h-48 w-full items-center justify-center overflow-hidden rounded-md">
            {file.mimeType === "application/pdf" ? (
              <div className="group relative flex h-48 w-full cursor-pointer items-center justify-center overflow-hidden rounded-md">
                <AiOutlineFilePdf className="group size-24 text-red-500" />
                <span className="bg-opacity-50 absolute right-0 bottom-0 left-0 bg-black/80 p-1 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {file.name}
                </span>
                <Button
                  onClick={() => handleDelete(file.id)}
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="group relative h-48 w-full overflow-hidden rounded-md">
                <Link
                  href={`/dashboard/workspaces/${workspaceId}/projects/${projectId}/files/${file.id}`}
                >
                  <Image
                    src={file.url}
                    alt={file.name}
                    fill
                    className="cursor-pointer object-cover"
                    unoptimized
                  />
                  <span className="bg-opacity-50 absolute right-0 bottom-0 left-0 truncate bg-black/80 p-1 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {file.name}
                  </span>
                </Link>
                <Button
                  onClick={() => handleDelete(file.id)}
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
