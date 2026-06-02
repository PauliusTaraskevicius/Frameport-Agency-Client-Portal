import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import type { CommentReply, CommentWithReplies } from "./types";
import { formatDistanceToNow } from "date-fns";

interface CommentItemProps {
  comment: CommentWithReplies | CommentReply;
  onReply?: (parentId: string) => void;
  onDelete?: (commentId: string) => void;
  currentUserId?: string;
}

export const CommentItem = ({
  comment,
  onReply,
  onDelete,
  currentUserId,
}: CommentItemProps) => {
  const displayName = comment.author
    ? `${comment.author.user.firstName} ${comment.author.user.lastName}`
    : (comment.client?.name ?? "Unknown user");

  const avatar =
    comment.author?.user.imageUrl ??
    comment.client?.avatarUrl ??
    "/default-avatar.png";

  const isOwn = comment.author?.user.clerkUserId === currentUserId;

  return (
    <div className="flex gap-3">
      <Avatar className="size-8 shrink-0">
        <AvatarImage src={avatar ?? undefined} />
        <AvatarFallback>{displayName[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{displayName}</span>
          <span className="text-muted-foreground text-xs">
            {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
          </span>
        </div>
        <p className="mt-1 text-sm">{comment.body}</p>
        <div className="mt-1 flex gap-3">
          {onReply && (
            <Button onClick={() => onReply(comment.id)} variant="default" className="cursor-pointer">
              Reply
            </Button>
          )}
          {isOwn && onDelete && (
            <Button onClick={() => onDelete(comment.id)} variant="destructive" className="cursor-pointer">
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
