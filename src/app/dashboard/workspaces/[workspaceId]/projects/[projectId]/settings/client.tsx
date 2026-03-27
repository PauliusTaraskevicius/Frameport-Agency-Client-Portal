"use client";

import { PageError } from "@/components/PageError";
import { PageLoader } from "@/components/PageLoader";
import { UpdateProjectForm } from "@/modules/projects/ui/components/UpdateProjectForm";


import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

interface ProjectIdSettingsClientProps {
  projectId: string;
}

export const ProjectIdSettingsClient = ({
  projectId,
}: ProjectIdSettingsClientProps) => {
  const trpc = useTRPC();

  const { data: initialValues, isLoading } = useQuery(
    trpc.projects.getOne.queryOptions({ projectId }),
  );

  if (isLoading) {
    return <PageLoader />;
  }

  if (!initialValues) {
    return <PageError message="Project not found." />;
  }

  return (
    <div className="w-full lg:max-w-xl">
      <UpdateProjectForm initialValues={initialValues} />
    </div>
  );
};
