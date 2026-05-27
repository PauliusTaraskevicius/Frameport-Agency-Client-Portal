"use client";

import { PageError } from "@/components/PageError";
import { useGetFile } from "../../api/use-get-file";
import { PageLoader } from "@/components/PageLoader";
import Image from "next/image";
import { AiOutlineFilePdf } from "react-icons/ai";

interface ClientFileIdPageProps {
  params: {
    fileId: string;
    projectId: string;
    workspaceId: string;
  };
}

const ClientFileIdPage = ({ params }: ClientFileIdPageProps) => {
  const { data: file, isLoading } = useGetFile({ fileId: params.fileId });

  if (isLoading) {
    return <PageLoader />;
  }

  if (!file) {
    return <PageError message="File not found" />;
  }

  return (
    <div className="flex h-full w-full">
      <div>
        {file.mimeType === "application/pdf" ? (
          <div className="bg-muted flex h-96 w-full cursor-pointer items-center justify-center overflow-hidden rounded-md">
            <AiOutlineFilePdf className="size-24 text-red-500" />
          </div>
        ) : (
          <Image
            src={file.url}
            alt={file.name}
            width={600}
            height={400}
            className="mb-4 rounded"
          />
        )}
        <h1 className="mb-4 text-center text-2xl font-bold">{file.name}</h1>
      </div>
      <div>{/* // Comments and other file details can go here */}</div>
    </div>
  );
};

export default ClientFileIdPage;
