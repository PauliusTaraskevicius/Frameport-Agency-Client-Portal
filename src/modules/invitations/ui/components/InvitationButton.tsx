"use client";

import { useCreateInvitationModal } from "@/modules/invitations/hooks/use-create-invitation-modal";
import { Button } from "@/components/ui/button";
import useGetRole from "@/modules/workspaces/api/use-get-role";
import { useWorkspaceId } from "@/modules/workspaces/hooks/use-workspace-id";

const InvitationButton = () => {
  const { open } = useCreateInvitationModal();
  const workspaceId = useWorkspaceId();
  const roleQuery = useGetRole({ workspaceId: workspaceId });
  const isClient = roleQuery.data?.isClient ?? false;

  return (
    <div>
      <Button disabled={isClient} onClick={open}>
        Invite Client
      </Button>
    </div>
  );
};

export default InvitationButton;
