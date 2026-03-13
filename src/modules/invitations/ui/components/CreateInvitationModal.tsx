"use client";


import { ResponsiveModal } from "@/components/ResponsiveModal";
import { useCreateInvitationModal } from "../../hooks/use-create-invitation-modal";
import { SendInvitationForm } from "./SendInvitationForm";


export const CreateInvitationModal = () => {
  const { isOpen, setIsOpen, close } = useCreateInvitationModal();

  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <SendInvitationForm onCancel={close} />
    </ResponsiveModal>
  );
};
