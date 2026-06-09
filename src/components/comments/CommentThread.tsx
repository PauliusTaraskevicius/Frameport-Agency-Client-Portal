import { useState } from "react";

import { CommentWithReplies } from "./types";
import { CommentItem } from "./CommentItem";
import { CommentInput } from "./CommentInput";
import { useAuth } from "@clerk/nextjs";

const REPLIES_THRESHOLD = 1; // collapse when > 1 reply

interface CommentThreadProps {
  comment: CommentWithReplies;
  onSubmit: (body: string, parentId: string) => Promise<void> | void;
  onDelete?: (commentId: string) => void;
  onUpdate?: (commentId: string, body: string) => void;
}

export const CommentThread = ({
  comment,
  onSubmit,
  onDelete,
  onUpdate,
}: CommentThreadProps) => {
  const { userId: currentUserId } = useAuth();

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showReplies, setShowReplies] = useState(false);
  const replyCount = comment.replies.length;

  return (
    <div className="flex flex-col gap-3">
      <CommentItem
        comment={comment}
        onReply={(id) => setReplyingTo(replyingTo === id ? null : id)}
        currentUserId={currentUserId ?? undefined}
        onDelete={onDelete}
        onUpdate={onUpdate}
      />

      {/* Reply input */}
      {replyingTo === comment.id && (
        <div className="ml-11">
          {/* Your reply input component goes here */}
          <CommentInput
            parentId={comment.id}
            onSuccess={() => setReplyingTo(null)}
            placeholder="Write a reply..."
            onSubmit={(body) => onSubmit(body, comment.id)}
          />
        </div>
      )}

      {/* Replies section */}
      {replyCount > 0 && (
        <div className="ml-11 flex flex-col gap-3 border-l-2 pl-4">
          {replyCount > REPLIES_THRESHOLD && !showReplies ? (
            <button
              onClick={() => setShowReplies(true)}
              className="text-primary cursor-pointer text-left text-xs font-semibold"
            >
              Show all {replyCount} replies
            </button>
          ) : (
            <>
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId ?? undefined}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                />
              ))}
              {replyCount > REPLIES_THRESHOLD && (
                <button
                  onClick={() => setShowReplies(false)}
                  className="text-muted-foreground cursor-pointer text-left text-xs font-semibold"
                >
                  Hide replies
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
