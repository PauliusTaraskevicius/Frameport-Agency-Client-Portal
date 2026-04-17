"use client";

import { ResponsiveModal } from "@/components/ResponsiveModal";

import { useUpdateTaskModal } from "../hooks/use-update-task-modal";
import { UpdateTaskFormWrapper } from "./UpdateTaskFormWrapper";

export const UpdateTaskModal = () => {
  const { taskId, close } = useUpdateTaskModal();

  return (
    <ResponsiveModal open={!!taskId} onOpenChange={close}>
      {taskId && <UpdateTaskFormWrapper onCancel={close} id={taskId} />}
    </ResponsiveModal>
  );
};
