import { UserButton } from "@clerk/nextjs";
import { MobileSidebar } from "./MobileSidebar";

export const Navbar = () => {
  return (
    <nav className="flex items-center justify-between lg:pt-4 mb-6">
      <div className="hidden flex-col lg:flex">
        <p className="text-muted-foreground">
          Monitor all of your projects and tasks here
        </p>
      </div>
      <MobileSidebar />
      <div className="items-end">
        <UserButton />
      </div>
    </nav>
  );
};
