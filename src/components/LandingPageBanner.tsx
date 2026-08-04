import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const LandingPageBanner = () => {
  return (
    <section className="relative flex w-full flex-col items-center overflow-hidden bg-white pt-16 pb-24 md:pt-24 md:pb-32">
      {/* Subtle background gradient mesh */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,0,0,0.03),transparent_50%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-screen-xl flex-col items-start px-8">
        {/* Headline */}
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance text-black md:text-6xl lg:text-7xl">
          <span className="bg-gradient-to-r from-neutral-900 via-neutral-600 to-neutral-900 bg-clip-text text-transparent">
            Work with clients, not around them.
          </span>
          <br />
          <span className="text-neutral-400">
            Keep every project moving forward.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 max-w-2xl text-lg text-balance text-neutral-500 md:text-xl">
          Purpose-built for planning and building products. Designed for the AI
          era.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex items-center gap-4">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-black px-8 text-sm font-medium text-white hover:bg-neutral-800"
          >
            <Link href="/sign-up">Get started</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full border-neutral-300 px-8 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
          >
            <Link href="/contact">Contact sales</Link>
          </Button>
        </div>
        {/* Dashboard Image — fixed width, anchored right, left side clips on resize */}
        <div className="relative mt-16 w-full overflow-hidden md:mt-24">
          {/* justify-end pins the image to the right; on desktop it can be centered if preferred */}
          <div className="flex justify-start md:justify-center">
            <div className="w-[1200px] shrink-0 md:w-[1200px]">
              <Image
                src="/dashboard_image.jpg"
                alt="Frameport Dashboard"
                width={1920}
                height={1080}
                className="h-auto w-full"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
