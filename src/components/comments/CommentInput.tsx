"use client";

import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CommentInputProps {
  onSubmit: (body: string) => Promise<void> | void;
  parentId?: string;
  onSuccess?: () => void;
  placeholder?: string;
}

export const CommentInput = ({
  parentId,
  onSuccess,
  placeholder = "Write a comment...",
  onSubmit,
}: CommentInputProps) => {
  const [body, setBody] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async () => {
    const trimmed = body.trim();
    if (!trimmed) return;

    setIsPending(true);

    try {
      await onSubmit(trimmed);
      setBody("");
      onSuccess?.();
    } finally {
      setIsPending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isPending}
        rows={3}
        className="resize-none"
      />
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs">
          Ctrl+Enter to submit
        </span>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isPending || !body.trim()}
          className="cursor-pointer"
        >
          {isPending ? "Posting..." : parentId ? "Reply" : "Comment"}
        </Button>
      </div>
    </div>
  );
};
