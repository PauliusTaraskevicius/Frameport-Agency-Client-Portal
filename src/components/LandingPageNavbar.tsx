"use client";

import { Button } from "./ui/button";
import Link from "next/link";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";

const routes = [
  {
    label: "Product",
    href: "/product",
  },
  {
    label: "Pricing",
    href: "/pricing",
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

export const LandingPageNavbar = () => {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 mx-auto hidden w-full max-w-screen-xl justify-center p-8 backdrop-blur-md md:flex">
      <div className="flex w-full justify-between">
        <div>
          <Link href="/">
            <Image src="/logo.svg" height={150} width={150} alt="Logo" />
          </Link>
        </div>
        <div className="flex items-center justify-center">
          <ul className="flex items-center justify-center gap-6">
            {routes.map((route) => {
              const isActive = pathname === route.href;

              return (
                <Link key={route.href} href={route.href}>
                  {" "}
                  <button
                    className={cn(
                      "hover:bg-primary/90 rounded-full p-2 transition hover:text-white",
                      isActive && "font-semibold",
                    )}
                  >
                    <li className="cursor-pointer text-[13px]">
                      {route.label}
                    </li>
                  </button>
                </Link>
              );
            })}
          </ul>
          <div className="px-5">
            <hr className="h-[16px] w-px bg-black" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer rounded-full text-[13px]"
            >
              <Link href="/sign-in">Log in</Link>
            </Button>
            <Button
              variant="default"
              size="sm"
              className="cursor-pointer rounded-full text-[13px]"
            >
              <Link href="/sign-up">Sign up</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
