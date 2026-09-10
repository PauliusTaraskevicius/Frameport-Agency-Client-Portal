"use client";

import { UserButton } from "@clerk/nextjs";
import { MobileSidebar } from "./MobileSidebar";
import { usePathname } from "next/navigation";
import { useCreateInvitationModal } from "@/modules/invitations/hooks/use-create-invitation-modal";
import useGetRole from "@/modules/workspaces/api/use-get-role";
import { UserPlus } from "lucide-react";
import { useWorkspaceId } from "@/modules/workspaces/hooks/use-workspace-id";

const pathnameMap = {
  tasks: {
    title: "My Tasks",
    description: "View and manage all your assigned tasks across projects",
  },
  projects: {
    title: "Projects",
    description: "View and manage all your projects",
  },
};

const defaultMap = {
  title: "Home",
  description: "Monitor all of your projects and tasks here",
};

const NavbarUserButton = () => {
  const workspaceId = useWorkspaceId();
  const { open: openInvitation } = useCreateInvitationModal();
  const roleQuery = useGetRole({
    workspaceId: workspaceId ?? "",
    enabled: Boolean(workspaceId),
  });

  const showInviteItem =
    Boolean(workspaceId) && !roleQuery.isPending && !roleQuery.data?.isClient;

  return (
    <UserButton>
      {showInviteItem && (
        <UserButton.MenuItems>
          <UserButton.Action
            label="Invite Client"
            labelIcon={<UserPlus size={16} />}
            onClick={() => openInvitation()}
          />
        </UserButton.MenuItems>
      )}
    </UserButton>
  );
};

export const Navbar = () => {
  const pathname = usePathname();
  const pathnameParts = pathname.split("/");
  const pathnameKey = pathnameParts[4] as keyof typeof pathnameMap;

  const { title, description } = pathnameMap[pathnameKey] || defaultMap;

  return (
    <nav className="mb-6 flex items-center justify-between lg:pt-4">
      <div className="hidden flex-col lg:flex">
        <h1 className="hidden flex-col lg:flex">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <MobileSidebar />
      <div className="items-end">
        <NavbarUserButton />
      </div>
    </nav>
  );
};
