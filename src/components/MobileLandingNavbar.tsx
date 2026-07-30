"use client";

import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { TbMenu } from "react-icons/tb";
import { IoIosClose } from "react-icons/io";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

export const MobileLandingNavbar = () => {
  const [open, setOpen] = useState<boolean>(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Drawer direction="left" open={open} onOpenChange={setOpen}>
      <DrawerTrigger aria-label="Open navigation menu">
        <TbMenu className="size-6 cursor-pointer text-black" />
      </DrawerTrigger>
      <DrawerContent>
        <VisuallyHidden>
          <DrawerTitle>Navigation Menu</DrawerTitle>
        </VisuallyHidden>

        <DrawerHeader>
          <div className="relative flex items-center justify-between">
            <div className="flex w-full flex-col  space-y-4 py-16">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className="text-3xl font-semibold tracking-wide"
                >
                  {route.label}
                </Link>
              ))}
            </div>
            <div className="left-0 w-full absolute top-0">
              <div className="flex items-center justify-between">
                <Image src="/logo.svg" width={150} height={150} alt="logo" />

                <DrawerClose className="cursor-pointer" asChild>
                  <Button
                    variant="ghost"
                    className="cursor-pointer"
                    size="icon"
                  >
                    <IoIosClose className="size-7 text-black" />
                  </Button>
                </DrawerClose>
              </div>
            </div>
          </div>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
};
