"use client";

import { CreateWorkspaceForm } from "@/modules/workspaces/ui/components/CreateWorkspaceForm";

const WorkspaceCreatePage = () => {
  return (
    <div className="flex w-full items-center justify-center">
      <div className="w-full max-w-2xl p-4">
        <CreateWorkspaceForm  />
      </div>
    </div>
  );
};

export default WorkspaceCreatePage;
