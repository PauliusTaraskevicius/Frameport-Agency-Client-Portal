"use client";

import { CommentWithReplies } from "./types";
import { CommentThread } from "./CommentThread";
import { CommentInput } from "./CommentInput";

interface CommentsSectionProps {
  comments: CommentWithReplies[];
  onSubmit: (body: string, parentId?: string) => Promise<void> | void;
  onDelete?: (commentId: string) => void;
  onUpdate?: (commentId: string, body: string) => void;
}

export const CommentsSection = ({
  comments,
  onSubmit,
  onDelete,
  onUpdate,
}: CommentsSectionProps) => {
  return (
    <div className="flex flex-col gap-6">
      <CommentInput onSubmit={onSubmit} />
      <div className="flex flex-col gap-4">
        {comments.map((comment) => (
          <CommentThread
            key={comment.id}
            comment={comment}
            onSubmit={onSubmit}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
};
