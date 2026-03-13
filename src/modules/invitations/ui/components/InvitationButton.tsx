"use client";

import { useCreateInvitationModal } from "@/modules/invitations/hooks/use-create-invitation-modal";
import { Button } from "@/components/ui/button";

const InvitationButton = () => {
  const { open } = useCreateInvitationModal();

  return (
    <div>
      <Button onClick={open}>Invite Client</Button>
    </div>
  );
};

export default InvitationButton;