"use client";

import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

import Image from "next/image";
import { AiOutlineFilePdf } from "react-icons/ai";
import { useDeleteFile } from "../../api/use-delete-file";
import { Button } from "@/components/ui/button";
import {
  DownloadIcon,
  Ellipsis,
  MessageCircleMore,
  Trash2Icon,
} from "lucide-react";
import { useConfirm } from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/modules/workspaces/hooks/use-workspace-id";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetFileComments } from "../../api/use-get-file-comments";
import { File } from "@/generated/prisma/client";
import { useDownloadFile } from "../../api/use-download-file";

interface FileItemProps {
  file: File;
  projectId: string;
  onDelete: (fileId: string) => void;
}

export const FileItem = ({ file, projectId, onDelete }: FileItemProps) => {
  const workspaceId = useWorkspaceId();
  const downloadFile = useDownloadFile();

  const { data: comments } = useGetFileComments({
    fileId: file.id,
    projectId,
  });

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
    <>
      <DeleteDialog />
      <div key={file.id} className="w-full sm:w-64">
        <div className="bg-muted flex h-48 w-full items-center justify-center overflow-hidden rounded-md">
          {file.mimeType === "application/pdf" ? (
            <div className="group relative flex h-48 w-full cursor-pointer items-center justify-center overflow-hidden rounded-md">
              <Link
                href={`/dashboard/workspaces/${workspaceId}/projects/${projectId}/files/${file.id}`}
                className="absolute inset-0 z-0"
              />
              <AiOutlineFilePdf className="pointer-events-none relative z-10 size-24 text-red-500" />
              <span className="bg-opacity-50 pointer-events-none absolute right-0 bottom-0 left-0 z-10 bg-black/80 p-1 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
                {file.name}
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute top-2 right-2 z-20 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Ellipsis className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => downloadFile(file.id)}
                      className="cursor-pointer"
                    >
                      <DownloadIcon className="size-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(file.id)}
                      className="cursor-pointer"
                    >
                      <Trash2Icon className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <Link
                      href={`/dashboard/workspaces/${workspaceId}/projects/${projectId}/files/${file.id}`}
                    >
                      <DropdownMenuItem className="cursor-pointer">
                        <MessageCircleMore className="size-4" /> Comments{" "}
                        {(comments?.length ?? 0) > 0 && `(${comments?.length})`}
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute top-2 right-2 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Ellipsis className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => downloadFile(file.id)}
                      className="cursor-pointer"
                    >
                      <DownloadIcon className="size-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(file.id)}
                      className="cursor-pointer"
                    >
                      <Trash2Icon className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <Link
                      href={`/dashboard/workspaces/${workspaceId}/projects/${projectId}/files/${file.id}`}
                    >
                      <DropdownMenuItem className="cursor-pointer">
                        <MessageCircleMore className="size-4" /> Comments{" "}
                        {(comments?.length ?? 0) > 0 && `(${comments?.length})`}
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
