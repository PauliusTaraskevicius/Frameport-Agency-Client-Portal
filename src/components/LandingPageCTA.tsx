import Link from "next/link";
import { Button } from "@/components/ui/button";

export const LandingPageCTA = () => {
  return (
    <section className="w-full bg-white py-28 md:py-40">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <p className="text-sm font-medium text-neutral-500">Ready when you are</p>
        <h2 className="mt-5 text-4xl font-semibold tracking-tight text-black md:text-6xl">
          Better work starts with a clearer workspace.
        </h2>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-full bg-black px-8 text-white hover:bg-neutral-800">
            <Link href="/sign-up">Get started</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full border-neutral-300 px-8 hover:bg-neutral-100">
            <Link href="/contact">Contact sales</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
