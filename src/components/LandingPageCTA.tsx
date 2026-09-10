import Link from "next/link";
import { Button } from "@/components/ui/button";

export const LandingPageCTA = () => {
  return (
    <section className="w-full bg-white py-28 md:py-40">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <p className="text-sm font-medium text-muted-foreground">Ready when you are</p>
        <h2 className="mt-5 text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
          Better work starts with a clearer workspace.
        </h2>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-full bg-primary px-8 text-primary-foreground hover:bg-primary/90">
            <Link href="/sign-up">Get started</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full border-input px-8 hover:bg-accent">
            <Link href="/contact">Contact sales</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
