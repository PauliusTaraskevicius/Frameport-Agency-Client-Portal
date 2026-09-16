"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LandingPageFooter } from "@/components/LandingPageFooter";
import { Check, HelpCircle } from "lucide-react";

const plans = [
  {
    name: "Starter",
    description: "Perfect for freelancers and small studios getting started.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    cta: "Get started free",
    ctaHref: "/sign-up",
    ctaVariant: "outline" as const,
    features: [
      "Up to 3 projects",
      "2 team members",
      "Basic file storage",
      "Email notifications",
      "Community support",
    ],
  },
  {
    name: "Professional",
    description: "For growing teams that need more power and flexibility.",
    monthlyPrice: 29,
    yearlyPrice: 24,
    cta: "Start free trial",
    ctaHref: "/sign-up",
    ctaVariant: "default" as const,
    popular: true,
    features: [
      "Unlimited projects",
      "Up to 20 team members",
      "Advanced file versioning",
      "Priority support",
      "Custom workflows",
      "Client access controls",
      "Analytics dashboard",
    ],
  },
  {
    name: "Enterprise",
    description: "Dedicated support and security for large organizations.",
    monthlyPrice: 99,
    yearlyPrice: 79,
    cta: "Contact sales",
    ctaHref: "/contact",
    ctaVariant: "outline" as const,
    features: [
      "Everything in Professional",
      "Unlimited team members",
      "SSO & SAML",
      "Dedicated account manager",
      "Custom integrations",
      "SLA & audit logs",
      "On-premise option",
    ],
  },
];

const faqs = [
  {
    question: "Can I change plans at any time?",
    answer:
      "Yes. You can upgrade or downgrade your plan at any time. Prorated charges or credits will apply automatically.",
  },
  {
    question: "Is there a free trial for paid plans?",
    answer:
      "Absolutely. Every paid plan includes a 14-day free trial—no credit card required to start.",
  },
  {
    question: "What happens when I hit a plan limit?",
    answer:
      "We'll notify you before you reach any limit. You can upgrade instantly or archive old projects to free up space.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 30-day money-back guarantee on all paid plans. If Frameport is not the right fit, we'll refund you in full.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. We use industry-standard encryption, regular backups, and strict access controls. Enterprise plans include SSO and audit logs.",
  },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <main className="flex w-full flex-col">
      {/* Hero */}
      <section className="relative w-full overflow-hidden bg-white pt-16 pb-10 md:pt-24 md:pb-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,0,0,0.03),transparent_50%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center md:px-8">
          <h1 className="text-4xl font-semibold tracking-tight text-balance text-foreground md:text-6xl">
            Simple, transparent pricing.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-balance text-muted-foreground md:text-xl">
            Start free, upgrade when you need more power. No hidden fees, no
            surprises.
          </p>

          {/* Toggle */}
          <div className="mt-10 inline-flex items-center gap-3 rounded-full border border-border bg-muted p-1">
            <button
              onClick={() => setIsYearly(false)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                !isYearly
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                isYearly
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
              <span className="ml-1.5 text-xs font-semibold text-green-600">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="w-full bg-white pb-24 md:pb-32">
        <div className="mx-auto grid max-w-7xl gap-5 px-6 md:grid-cols-3 md:px-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border shadow-sm ${
                plan.popular
                  ? "border-primary/30 ring-1 ring-primary/20"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most popular
                </div>
              )}
              <CardContent className="flex flex-1 flex-col pt-8">
                <h3 className="text-lg font-semibold text-foreground">
                  {plan.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {plan.description}
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight text-foreground">
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                {isYearly && plan.yearlyPrice > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Billed annually
                  </p>
                )}

                <Button
                  asChild
                  variant={plan.ctaVariant}
                  className={`mt-6 w-full rounded-full ${
                    plan.ctaVariant === "default"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-input hover:bg-accent"
                  }`}
                >
                  <Link href={plan.ctaHref}>{plan.cta}</Link>
                </Button>

                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full border-y border-border bg-muted py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 md:px-8">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">FAQ</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Questions? Answers.
            </h2>
          </div>

          <div className="mt-16 space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-border bg-card p-6 md:p-8"
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {faq.question}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-white py-28 md:py-40">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Still unsure?
          </p>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            Let&apos;s find the right plan for you.
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-primary px-8 text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/sign-up">Start free trial</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border-input px-8 hover:bg-accent"
            >
              <Link href="/contact">Talk to sales</Link>
            </Button>
          </div>
        </div>
      </section>

      <LandingPageFooter />
    </main>
  );
}
