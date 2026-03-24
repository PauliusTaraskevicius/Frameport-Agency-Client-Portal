import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

import z from "zod";

export const projectsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(1, "Name is required")
          .max(255, "Name is too long"),
        description: z.string().max(1024, "Description is too long").optional(),
        workspaceId: z.string().min(1),
        clientId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const project = await prisma.project.create({
          data: {
            name: input.name,
            description: input.description,
            workspaceId: input.workspaceId,
            clientId: input.clientId,
          },
        });

        return project;
      } catch (error) {
        const existingProject = await prisma.project.findFirst({
          where: {
            name: input.name,
          },
        });

        if (existingProject) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A project with this name already exists",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while creating the project",
        });
      }
    }),

  getMany: protectedProcedure
    .input(z.object({ workspaceId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        const projects = await prisma.project.findMany({
          where: {
            workspaceId: input.workspaceId,
            OR: [
              // Team members see all projects in their workspaces
              {
                workspace: {
                  members: {
                    some: {
                      userId: ctx.auth.userId,
                    },
                  },
                },
              },
              // Clients see only projects assigned to them
              {
                client: {
                  userId: ctx.auth.userId,
                },
              },
            ],
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return projects;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while fetching projects",
        });
      }
    }),
});
