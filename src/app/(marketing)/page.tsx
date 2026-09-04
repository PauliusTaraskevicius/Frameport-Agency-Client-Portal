import { LandingPageBanner } from "@/components/LandingPageBanner";
import { LandingPageCTA } from "@/components/LandingPageCTA";
import { LandingPageFeatures } from "@/components/LandingPageFeatures";
import { LandingPageFooter } from "@/components/LandingPageFooter";
import { LandingPageTestimonials } from "@/components/LandingPageTestimonials";
import { LandingPageValueProps } from "@/components/LandingPageValueProps";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  // If already signed in, redirect to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="flex w-full flex-col">
      <LandingPageBanner />
      <LandingPageValueProps />
      <LandingPageFeatures />
      <LandingPageTestimonials />
      <LandingPageCTA />
      <LandingPageFooter />
    </main>
  );
}
