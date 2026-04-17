import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { CreateWorkspaceModal } from "@/modules/workspaces/ui/components/CreateWorkspaceModal";
import { CreateInvitationModal } from "@/modules/invitations/ui/components/CreateInvitationModal";
import { CreateProjectModal } from "@/modules/projects/ui/components/CreateProjectModal";
import { CreateTaskModal } from "@/modules/tasks/components/CreateTaskModal";
import { UpdateTaskModal } from "@/modules/tasks/components/UpdateTaskModal";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen">
      <CreateWorkspaceModal />
      <CreateInvitationModal />
      <CreateProjectModal />
      <CreateTaskModal />
      <UpdateTaskModal />
      <div className="flex h-full w-full">
        <div className="fixed top-0 left-0 hidden h-full overflow-y-auto lg:block lg:w-66">
          <Sidebar />
        </div>
        <div className="w-full lg:pl-66">
          <div className="mx-auto h-full">
            <main className="flex h-full flex-col px-6 py-8">
              <Navbar />
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
