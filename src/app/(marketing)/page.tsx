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
    <div className="flex flex-col justify-center">
      <div>HomePAGE</div>
    </div>
  );
}
