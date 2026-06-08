"use client";

import { PageError } from "@/components/PageError";
import { useGetFile } from "../../api/use-get-file";
import { PageLoader } from "@/components/PageLoader";
import Image from "next/image";
import { AiOutlineFilePdf } from "react-icons/ai";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { useGetFileComments } from "../../api/use-get-file-comments";
import { useCreateComment } from "../../api/use-create-comment";

interface ClientFileIdPageProps {
  params: {
    fileId: string;
    projectId: string;
    workspaceId: string;
  };
}

const ClientFileIdPage = ({ params }: ClientFileIdPageProps) => {
  const { data: file, isLoading: isFileLoading } = useGetFile({
    fileId: params.fileId,
  });
  const { data: comments, isLoading: isCommentsLoading } = useGetFileComments({
    fileId: params.fileId,
    projectId: params.projectId,
  });

  const createFileCommentMutation = useCreateComment(
    params.fileId,
    params.projectId,
  );

  if (isFileLoading || isCommentsLoading) {
    return <PageLoader />;
  }

  if (!file) {
    return <PageError message="File not found" />;
  }

  return (
    <div className="h-full w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-[600px] flex-col items-center justify-center">
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
        <div className="w-[600px]">
          {" "}
          <CommentsSection
            comments={comments ?? []}
            onSubmit={async (body, parentId) => {
              await createFileCommentMutation.mutateAsync({
                projectId: params.projectId,
                fileId: params.fileId,
                body,
                parentId,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientFileIdPage;
