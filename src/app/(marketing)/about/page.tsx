import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LandingPageFooter } from "@/components/LandingPageFooter";
import { Target, Heart, Lightbulb, Handshake } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Clarity first",
    description:
      "We believe the best work happens when everyone knows what they are doing and why. Complexity is the enemy.",
  },
  {
    icon: Heart,
    title: "Craft matters",
    description:
      "Details are not afterthoughts. We obsess over the small things because they add up to a product people trust.",
  },
  {
    icon: Lightbulb,
    title: "Build with intention",
    description:
      "Every feature we ship solves a real problem. We listen first, build second, and iterate always.",
  },
  {
    icon: Handshake,
    title: "Partners, not vendors",
    description:
      "We succeed when our customers succeed. Long-term relationships beat short-term wins every time.",
  },
];

const team = [
  {
    name: "Alex Rivera",
    role: "CEO & Co-Founder",
    bio: "Former product lead at a digital agency. Obsessed with making client work less chaotic.",
  },
  {
    name: "Sam Okonkwo",
    role: "CTO & Co-Founder",
    bio: "Engineer who believes great tools should feel invisible. Builds systems that scale.",
  },
  {
    name: "Priya Sharma",
    role: "Head of Design",
    bio: "Champion of calm interfaces. Every pixel earns its place.",
  },
  {
    name: "Jordan Lee",
    role: "Head of Customer Success",
    bio: "Former account director. Makes sure every customer feels heard and supported.",
  },
];

export const metadata = {
  title: "About — Frameport",
  description:
    "Meet the team behind Frameport and learn why we're building a better way to manage client work.",
};

const AboutPage = () => {
  return (
    <main className="flex w-full flex-col">
      {/* Hero */}
      <section className="relative w-full overflow-hidden bg-white pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,0,0,0.03),transparent_50%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
          <p className="text-sm font-medium text-muted-foreground">About us</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-balance text-foreground md:text-6xl">
            We&apos;re building the workspace{" "}
            <span className="text-muted-foreground">
              we always wished we had.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-balance text-muted-foreground md:text-xl">
            Frameport was born from years of managing client projects in tools
            that were either too simple or too complex. We set out to build
            something calm, focused, and intentionally designed for teams who
            care about the work.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="w-full border-y border-border bg-muted py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-2 md:items-center md:px-8">
          <div className="rounded-3xl bg-card p-4 md:p-8">
            <Image
              src="/dashboard_image1.jpg"
              alt="Frameport workspace"
              width={1897}
              height={754}
              className="h-auto w-full rounded-xl border border-border shadow-lg shadow-border/50"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Our story
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              From agency chaos to calm collaboration.
            </h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              We spent a decade juggling spreadsheets, email threads, and
              disconnected tools to keep clients happy. When nothing felt right,
              we decided to build it ourselves.
            </p>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Today, Frameport helps agencies, studios, and product teams around
              the world deliver better work with less friction. We are just
              getting started.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="w-full bg-card py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <p className="text-sm font-medium text-muted-foreground">Values</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
            The principles that guide everything we do.
          </h2>

          <div className="mt-16 grid gap-5 sm:grid-cols-2">
            {values.map((value) => (
              <Card
                key={value.title}
                className="rounded-2xl border border-border bg-muted shadow-sm"
              >
                <CardContent className="pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <value.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-foreground">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="w-full border-y border-border bg-muted py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <p className="text-sm font-medium text-muted-foreground">The team</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
            Meet the people behind the product.
          </h2>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <Card
                key={member.name}
                className="rounded-2xl border border-border bg-card shadow-sm"
              >
                <CardContent className="pt-6">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-muted">
                    <Image
                      src="/default-avatar.png"
                      alt={member.name}
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-foreground">
                    {member.name}
                  </h3>
                  <p className="text-sm text-primary">{member.role}</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-white py-28 md:py-40">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Join the mission
          </p>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            We&apos;re always looking for kind, curious people.
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-primary px-8 text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/contact">Get in touch</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border-input px-8 hover:bg-accent"
            >
              <Link href="/sign-up">Try Frameport</Link>
            </Button>
          </div>
        </div>
      </section>

      <LandingPageFooter />
    </main>
  );
};

export default AboutPage;
