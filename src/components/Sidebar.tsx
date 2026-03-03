import Image from "next/image";
import Link from "next/link";
import { DottedSeparator } from "./DottedSeparator";
import { Navigation } from "./Navigation";

export const Sidebar = () => {
  
  return (
    <aside className="h-full w-full bg-neutral-100 p-4">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Image src="/logo.svg" alt="logo" width={164} height={48} />
        </Link>
      </div>
      <DottedSeparator className="my-4" />

      <Navigation />
    </aside>
  );
};
