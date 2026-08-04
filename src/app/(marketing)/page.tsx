import { LandingPageBanner } from "@/components/LandingPageBanner";
import { LandingPageNavbar } from "@/components/LandingPageNavbar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  // If already signed in, redirect to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex w-full flex-col">
      <LandingPageBanner />
    </div>
  );
}
