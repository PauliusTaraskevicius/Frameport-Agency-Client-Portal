"use client";

import { useState } from "react";
import { PageError } from "@/components/PageError";
import { useGetFile } from "../../api/use-get-file";
import { PageLoader } from "@/components/PageLoader";

import { CommentsSection } from "@/components/comments/CommentsSection";
import { useGetFileComments } from "../../api/use-get-file-comments";
import { useCreateComment } from "../../api/use-create-comment";
import { useDeleteComment } from "../../api/use-delete-comment";
import { useUpdateComment } from "../../api/use-update-comment";
import { useDownloadFile } from "../../api/use-download-file";

import { FileVersionTabs } from "./FileVersionTabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityFeed } from "@/modules/activity/ui/components/ActivityFeed";
import { useGetFileActivity } from "@/modules/activity/api/use-get-file-activity";

interface ClientFileIdPageProps {
  params: {
    fileId: string;
    projectId: string;
    workspaceId: string;
  };
}

const ClientFileIdPage = ({ params }: ClientFileIdPageProps) => {
  const downloadFile = useDownloadFile();
  const [activityPage, setActivityPage] = useState(1);

  const { data: file, isLoading: isFileLoading } = useGetFile({
    fileId: params.fileId,
  });
  const { data: comments, isLoading: isCommentsLoading } = useGetFileComments({
    fileId: params.fileId,
    projectId: params.projectId,
  });

  const deleteFileCommentMutation = useDeleteComment(
    params.fileId,
    params.projectId,
  );

  const updateFileCommentMutation = useUpdateComment(
    params.fileId,
    params.projectId,
  );

  const createFileCommentMutation = useCreateComment(
    params.fileId,
    params.projectId,
  );

  const getActivity = useGetFileActivity({
    fileId: params.fileId,
    page: activityPage,
    limit: 10,
  });

  const isClient = file?.isClient;

  if (isFileLoading || isCommentsLoading) {
    return <PageLoader />;
  }

  if (!file) {
    return <PageError message="File not found" />;
  }

  return (
    <div className="h-full w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-[600px] flex-col items-center justify-center">
        <FileVersionTabs
          fileId={params.fileId}
          projectId={params.projectId}
          projectClientId={file.project.clientId}
          isClient={file.isClient}
        />

        <h1 className="mb-4 text-center text-2xl font-bold">{file.name}</h1>

        <Tabs defaultValue="file" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="file" className="flex-1">
              File
            </TabsTrigger>
            {!isClient && (
              <TabsTrigger value="activity" className="flex-1">
                Activity
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="file" className="mt-4">
            <div className="w-[600px]">
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
                onDelete={(commentId) =>
                  deleteFileCommentMutation.mutate({
                    commentId,
                    projectId: params.projectId,
                  })
                }
                onUpdate={(commentId, body) =>
                  updateFileCommentMutation.mutate({
                    commentId,
                    projectId: params.projectId,
                    body,
                  })
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <div className="bg-muted rounded-lg p-4">
              <p className="mb-4 text-lg font-semibold">Activity</p>
              <ActivityFeed
                logs={getActivity.data?.logs ?? []}
                totalPages={getActivity.data?.totalPages ?? 0}
                currentPage={getActivity.data?.currentPage ?? 1}
                onPageChange={setActivityPage}
                isLoading={getActivity.isLoading}
                error={getActivity.error}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientFileIdPage;
