"use client";

import { CommentWithReplies } from "./types";
import { CommentThread } from "./CommentThread";
import { CommentInput } from "./CommentInput";

interface CommentsSectionProps {
  comments: CommentWithReplies[];
  onSubmit: (body: string, parentId?: string) => Promise<void> | void;
}

export const CommentsSection = ({ comments, onSubmit }: CommentsSectionProps) => {
  return (
    <div className="flex flex-col gap-6">
      <CommentInput onSubmit={onSubmit} />
      <div className="flex flex-col gap-4">
        {comments.map((comment) => (
          <CommentThread key={comment.id} comment={comment} onSubmit={onSubmit} />
        ))}
      </div>
    </div>
  );
};