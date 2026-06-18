import { Trash2Icon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

import type { CommentReply, CommentWithReplies } from "./types";
import { formatDistanceToNow } from "date-fns";
import { FaReply } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useState } from "react";
import { Textarea } from "../ui/textarea";
import { Hint } from "../Hint";
import { useConfirm } from "@/hooks/use-confirm";

interface CommentItemProps {
  comment: CommentWithReplies | CommentReply;
  onReply?: (parentId: string) => void;
  onDelete?: (commentId: string) => void;
  onUpdate?: (commentId: string, body: string) => void;
  currentUserId?: string;
}

export const CommentItem = ({
  comment,
  onReply,
  onDelete,
  currentUserId,
  onUpdate,
}: CommentItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(comment.body || "");

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Comment",
    "This action cannot be undone.",
  );

  const displayName = comment.author
    ? [comment.author.user.firstName, comment.author.user.lastName]
        .filter(Boolean)
        .join(" ")
    : (comment.client?.name ?? "Unknown user");

  const avatar =
    comment.author?.user.imageUrl ??
    comment.client?.avatarUrl ??
    "/default-avatar.png";

  const isOwn =
    comment.author?.user.clerkUserId === currentUserId ||
    comment.client?.userId === currentUserId;

  const handleSave = () => {
    onUpdate?.(comment.id, value);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    const ok = await confirmDelete();

    if (!ok) return;

    onDelete?.(comment.id);
  };

  return (
    <div className="flex gap-3">
      <DeleteDialog />
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

        {isEditing ? (
          <div className="mt-1 flex flex-col gap-2">
            <Textarea
              className="border-input bg-background w-full rounded-md border p-2 text-sm"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={2}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="text-primary cursor-pointer text-xs font-semibold"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setValue(comment.body || "");
                }}
                className="text-muted-foreground cursor-pointer text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm">{comment.body}</p>
        )}

        <div className="mt-1 flex gap-3">
          {!isEditing && onReply && (
            <Hint description="Reply to this comment">
              <FaReply
                className="size-4 cursor-pointer"
                onClick={() => onReply(comment.id)}
              />
            </Hint>
          )}
          {!isEditing && isOwn && onDelete && (
            <Hint description="Delete this comment">
              <Trash2Icon
                className="size-4 cursor-pointer"
                onClick={handleDelete}
              />
            </Hint>
          )}
          {!isEditing && isOwn && onUpdate && (
            <Hint description="Edit this comment">
              <MdEdit
                className="size-4 cursor-pointer"
                onClick={() => setIsEditing(true)}
              />
            </Hint>
          )}
        </div>
      </div>
    </div>
  );
};
