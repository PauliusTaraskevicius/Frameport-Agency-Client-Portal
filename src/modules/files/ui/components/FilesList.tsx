"use client";

import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { AiOutlineFilePdf } from "react-icons/ai";

interface FilesListProps {
  projectId: string;
}

export const FilesList = ({ projectId }: FilesListProps) => {
  const trpc = useTRPC();

  const { data: files } = useQuery(
    trpc.files.getMany.queryOptions({ projectId }),
  );

  return (
    <div className="flex flex-col  gap-4 sm:flex-row sm:flex-wrap">
      {files?.map((file) => (
        <div key={file.id} className="w-full sm:w-64">
          <div className="bg-muted flex h-48 w-full items-center justify-center overflow-hidden rounded-md">
            {file.mimeType === "application/pdf" ? (
              <div className="group relative flex h-48 w-full cursor-pointer items-center justify-center overflow-hidden rounded-md">
                <AiOutlineFilePdf className="group size-20" />
                <span className="bg-opacity-50 absolute right-0 bottom-0 left-0 bg-black/80 p-1 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {file.name}
                </span>
              </div>
            ) : (
              <div className="group relative h-48 w-full overflow-hidden rounded-md">
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
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
