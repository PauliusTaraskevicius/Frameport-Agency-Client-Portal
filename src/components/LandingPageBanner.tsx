import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const LandingPageBanner = () => {
  return (
    <section className="relative flex w-full flex-col items-center overflow-hidden bg-white pt-16 pb-24 md:pt-24 md:pb-32">
      {/* Subtle background gradient mesh */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,0,0,0.03),transparent_50%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-start px-6 md:px-8">
        {/* Headline */}
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance text-foreground md:text-6xl lg:text-7xl">
          <span className="">
            Work with clients, not around them.
          </span>
          <br />
          <span className="text-muted-foreground">
            Keep every project moving forward.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 max-w-2xl text-lg text-balance text-muted-foreground md:text-xl">
          Purpose-built for planning and building products. Designed for the AI
          era.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex items-center gap-4">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/sign-up">Get started</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full border-input px-8 text-sm font-medium text-foreground hover:bg-accent"
          >
            <Link href="/contact">Contact sales</Link>
          </Button>
        </div>

        <div className="relative mt-16 w-full overflow-hidden md:mt-24">

          <div className="flex justify-start md:justify-center">
            <div className="w-[1200px] shrink-0 md:w-[1200px]">
              <Image
                src="/dashboard_image1.jpg"
                alt="Frameport Dashboard"
                width={1897}
                height={754}
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
