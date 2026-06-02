import { Prisma } from "@/generated/prisma/client";

export type CommentReply = Prisma.CommentsGetPayload<{
  include: {
    author: { include: { user: true } };
    client: true;
  };
}>;

export type CommentWithReplies = Prisma.CommentsGetPayload<{
  include: {
    author: { include: { user: true } };
    client: true;
    replies: {
      include: {
        author: { include: { user: true } };
        client: true;
      };
    };
  };
}>;
