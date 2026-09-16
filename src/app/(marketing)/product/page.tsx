import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LandingPageFooter } from "@/components/LandingPageFooter";
import {
  FolderKanban,
  MessageSquare,
  Files,
  CalendarDays,
  BarChart3,
  ShieldCheck,
  Zap,
  Users,
} from "lucide-react";

const capabilities = [
  {
    icon: FolderKanban,
    title: "Project Hub",
    description:
      "Organize every project into dedicated workspaces with clear milestones, deliverables, and ownership.",
  },
  {
    icon: MessageSquare,
    title: "Client Collaboration",
    description:
      "Share updates, gather feedback, and keep stakeholders in the loop without endless email threads.",
  },
  {
    icon: Files,
    title: "File Management",
    description:
      "Upload, review, and approve deliverables in one place with version history and contextual comments.",
  },
  {
    icon: CalendarDays,
    title: "Task Scheduling",
    description:
      "Plan sprints, set deadlines, and visualize workloads so the team knows what to tackle next.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Real-time dashboards show exactly where each project stands and what needs attention today.",
  },
  {
    icon: ShieldCheck,
    title: "Permissions & Security",
    description:
      "Granular access controls let you share what matters while keeping internal work private.",
  },
];

const workflowSteps = [
  {
    number: "01",
    title: "Set up your workspace",
    description:
      "Create a project, invite your team, and define the deliverables everyone will work toward.",
    image: "/dashboard_image1.jpg",
  },
  {
    number: "02",
    title: "Collaborate in real time",
    description:
      "Share files, exchange feedback, and track decisions as they happen—no context switching required.",
    image: "/progress.jpg",
  },
  {
    number: "03",
    title: "Deliver with confidence",
    description:
      "Hit milestones on schedule, present polished work, and close the loop with full audit history.",
    image: "/activity.jpg",
  },
];

export const metadata = {
  title: "Product — Frameport",
  description:
    "Discover how Frameport helps teams plan, build, and deliver client work with clarity and momentum.",
};

const ProductPage = () => {
  return (
    <main className="flex w-full flex-col">
      {/* Hero */}
      <section className="relative w-full overflow-hidden bg-white pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,0,0,0.03),transparent_50%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance text-foreground md:text-6xl">
            Everything you need to{" "}
            <span className="text-muted-foreground">
              ship great client work.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-balance text-muted-foreground md:text-xl">
            Frameport brings projects, files, feedback, and timelines into one
            calm, focused workspace—so your team can do its best work.
          </p>
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
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="w-full border-y border-border bg-muted py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <p className="text-sm font-medium text-muted-foreground">
            Capabilities
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
            Built for the way modern teams work.
          </h2>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((cap) => (
              <Card
                key={cap.title}
                className="rounded-2xl border border-border bg-card shadow-sm"
              >
                <CardContent className="pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <cap.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-foreground">
                    {cap.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {cap.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="w-full bg-card py-24 md:py-36">
        <div className="mx-auto max-w-7xl space-y-28 px-6 md:space-y-40 md:px-8">
          {workflowSteps.map((step, index) => (
            <article
              key={step.number}
              className={`flex flex-col items-center gap-12 md:gap-20 ${
                index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
              }`}
            >
              <div className="w-full flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  <span>{step.number}</span>{" "}
                  <span className="ml-2 text-foreground">Step →</span>
                </p>
                <h2 className="mt-5 max-w-xl text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                  {step.title}
                </h2>
                <p className="mt-5 max-w-lg text-lg leading-8 text-muted-foreground">
                  {step.description}
                </p>
              </div>

              <div className="w-full flex-1 rounded-3xl bg-muted p-4 md:p-8">
                <Image
                  src={step.image}
                  alt={step.title}
                  width={1897}
                  height={754}
                  className="h-auto w-full rounded-xl border border-border shadow-lg shadow-border/50"
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Why Frameport */}
      <section className="w-full border-y border-border bg-muted py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Why teams choose Frameport
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                Clarity for your team. Confidence for your clients.
              </h2>
            </div>
            <div className="grid gap-6">
              {[
                {
                  icon: Zap,
                  title: "Move faster",
                  text: "Reduce back-and-forth with clear ownership and async-friendly workflows.",
                },
                {
                  icon: Users,
                  title: "Stay aligned",
                  text: "One shared view of progress keeps both internal teams and clients on the same page.",
                },
                {
                  icon: ShieldCheck,
                  title: "Trust & transparency",
                  text: "Show clients exactly where their project stands—without exposing internal noise.",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-white py-28 md:py-40">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Ready when you are
          </p>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            Better work starts with a clearer workspace.
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-primary px-8 text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/sign-up">Get started</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border-input px-8 hover:bg-accent"
            >
              <Link href="/contact">Contact sales</Link>
            </Button>
          </div>
        </div>
      </section>

      <LandingPageFooter />
    </main>
  );
};

export default ProductPage;
