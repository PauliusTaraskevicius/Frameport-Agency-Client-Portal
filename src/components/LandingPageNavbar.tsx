"use client";

import { Button } from "./ui/button";
import Link from "next/link";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { MobileLandingNavbar } from "./MobileLandingNavbar";

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
    <nav className="sticky top-0 z-50 w-full justify-center px-6 py-8 backdrop-blur-md md:px-8">
      <div className="mx-auto flex w-full max-w-7xl justify-between">
        <div className="flex items-center">
          <Link href="/">
            <Image src="/logo.svg" height={150} width={150} alt="Logo" />
          </Link>
        </div>
        <div className="flex items-center justify-center">
          <ul className="hidden items-center justify-center gap-6 md:flex">
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
                    <li className="cursor-pointer text-[13px] tracking-wide">
                      {route.label}
                    </li>
                  </button>
                </Link>
              );
            })}
          </ul>
          <div className="hidden px-5 md:block">
            <hr className="h-[16px] w-px bg-black" />
          </div>
          <div className="flex items-center justify-center  gap-2">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer rounded-full text-[13px] tracking-wide"
            >
              <Link href="/sign-in">Log in</Link>
            </Button>
            <Button
              variant="default"
              size="sm"
              className="cursor-pointer rounded-full text-[13px] tracking-wide"
            >
              <Link href="/sign-up">Sign up</Link>
            </Button>
            <div className="flex items-center md:hidden">
              <MobileLandingNavbar />{" "}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
