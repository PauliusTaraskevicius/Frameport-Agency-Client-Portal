"use client";

import { ResponsiveModal } from "@/components/ResponsiveModal";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { CreateTaskFormWrapper } from "./CreateTaskFormWrapper";

export const CreateTaskModal = () => {
  const { isOpen, setIsOpen, close, initialStatus } = useCreateTaskModal();

  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateTaskFormWrapper onCancel={close} initialStatus={initialStatus}/>
    </ResponsiveModal>
  );
};
