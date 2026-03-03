import { UserButton } from "@clerk/nextjs";
import { MobileSidebar } from "./MobileSidebar";

export const Navbar = () => {
  return (
    <nav className="flex items-center justify-between lg:px-6 lg:pt-4">
      <div className="hidden flex-col lg:flex">
        <h1 className="text-2xl font-semibold">Home</h1>
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
