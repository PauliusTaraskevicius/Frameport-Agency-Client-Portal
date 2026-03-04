"use client";

import { useCreateWorkspaceModal } from "../../hooks/use-create-workspace-modal";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { CreateWorkspaceForm } from "./CreateWorkspaceForm";

export const CreateWorkspaceModal = () => {
  const { isOpen, setIsOpen, close } = useCreateWorkspaceModal();

  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateWorkspaceForm onCancel={close} />
    </ResponsiveModal>
  );
};
