const testimonials = [
  {
    quote: "Frameport gives our clients confidence without adding another meeting to the calendar.",
    name: "Maya Chen",
    role: "Creative Director, Northstar",
  },
  {
    quote: "The whole team finally has one place to see what is happening and what needs to happen next.",
    name: "Daniel Brooks",
    role: "Operations Lead, Form Studio",
  },
];

export const LandingPageTestimonials = () => {
  return (
    <section className="w-full border-y border-border bg-muted py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <p className="text-sm font-medium text-muted-foreground">Loved by teams that care about the details</p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <blockquote key={testimonial.name} className="flex min-h-64 flex-col justify-between rounded-2xl border border-border bg-card p-8 md:p-10">
              <p className="text-xl font-medium leading-8 tracking-tight text-foreground">“{testimonial.quote}”</p>
              <footer className="mt-6">
                <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{testimonial.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
};
