import Image from "next/image";

const features = [
  {
    number: "1.0",
    label: "Collect",
    title: "Bring every request into focus.",
    description:
      "Capture client feedback, files, and open questions in one place. Everyone knows what needs attention and who owns the next step.",
    image: { src: "/dashboard_image1.jpg", width: 1897, height: 754 },
  },
  {
    number: "2.0",
    label: "Coordinate",
    title: "Make progress visible to everyone.",
    description:
      "Turn scattered updates into a calm, shared view of project status, upcoming milestones, and work that is ready for review.",
    image: { src: "/progress.jpg", width: 1871, height: 837 },
  },
  {
    number: "3.0",
    label: "Deliver",
    title: "Keep projects moving forward.",
    description:
      "Share polished work, gather decisions, and close the loop without losing the context behind every deliverable.",
    image: { src: "/activity.jpg", width: 1890, height: 822 },
  },
];

export const LandingPageFeatures = () => {
  return (
    <section className="w-full bg-card py-24 md:py-36">
      <div className="mx-auto max-w-7xl space-y-28 px-6 md:space-y-40 md:px-8">
        {features.map((feature, index) => (
          <article
            key={feature.number}
            className={`flex flex-col items-center gap-12 md:gap-20 ${
              index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
            }`}
          >
            <div className="w-full flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                <span>{feature.number}</span> <span className="ml-2 text-foreground">{feature.label} →</span>
              </p>
              <h2 className="mt-5 max-w-xl text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                {feature.title}
              </h2>
              <p className="mt-5 max-w-lg text-lg leading-8 text-muted-foreground">
                {feature.description}
              </p>
            </div>

            <div className="w-full flex-1 rounded-3xl bg-muted p-4 md:p-8">
              <Image
                src={feature.image.src}
                alt={`Frameport ${feature.label.toLowerCase()} view`}
                width={feature.image.width}
                height={feature.image.height}
                className="h-auto w-full rounded-xl border border-border shadow-lg shadow-border/50"
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
