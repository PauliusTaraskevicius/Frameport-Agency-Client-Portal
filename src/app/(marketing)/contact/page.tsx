import { ContactForm } from "@/components/ContactForm";
import { LandingPageFooter } from "@/components/LandingPageFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Phone, Clock } from "lucide-react";

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    lines: ["hello@frameport.io", "support@frameport.io"],
  },
  {
    icon: MapPin,
    title: "Office",
    lines: ["123 Market Street", "San Francisco, CA 94105"],
  },
  {
    icon: Phone,
    title: "Phone",
    lines: ["+1 (555) 123-4567"],
  },
  {
    icon: Clock,
    title: "Hours",
    lines: ["Mon – Fri: 9am – 6pm PST"],
  },
];

export const metadata = {
  title: "Contact Us — Frameport",
  description:
    "Get in touch with the Frameport team. We're here to help with sales, support, and general inquiries.",
};

const ContactPage = () => {
  return (
    <main className="flex w-full flex-col">
      {/* Header */}
      <section className="w-full px-6 pt-16 pb-10 md:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Contact us
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Have a question, need support, or want to partner with us? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="w-full px-6 pb-20 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-3">
          {/* Contact Info Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:content-start">
            {contactInfo.map((item) => (
              <Card key={item.title} className="rounded-xl border shadow-sm">
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {item.title}
                    </h3>
                    {item.lines.map((line) => (
                      <p
                        key={line}
                        className="text-sm text-muted-foreground"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Form Card */}
          <Card className="rounded-xl border shadow-sm lg:col-span-2">
            <CardContent className="pt-6">
              <h2 className="mb-6 text-xl font-semibold text-foreground">
                Send us a message
              </h2>
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </section>

      <LandingPageFooter />
    </main>
  );
};

export default ContactPage;
