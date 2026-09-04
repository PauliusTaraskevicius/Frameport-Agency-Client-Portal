import Image from "next/image";

const features = [
  {
    number: "1.0",
    label: "Collect",
    title: "Bring every request into focus.",
    description:
      "Capture client feedback, files, and open questions in one place. Everyone knows what needs attention and who owns the next step.",
    image: true,
  },
  {
    number: "2.0",
    label: "Coordinate",
    title: "Make progress visible to everyone.",
    description:
      "Turn scattered updates into a calm, shared view of project status, upcoming milestones, and work that is ready for review.",
    image: false,
  },
  {
    number: "3.0",
    label: "Deliver",
    title: "Keep projects moving forward.",
    description:
      "Share polished work, gather decisions, and close the loop without losing the context behind every deliverable.",
    image: true,
  },
];

function WorkspaceMockup() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xl shadow-neutral-200/50">
      <div className="flex items-center gap-2 border-b border-neutral-100 pb-4">
        <span className="size-2 rounded-full bg-neutral-300" />
        <span className="size-2 rounded-full bg-neutral-300" />
        <span className="size-2 rounded-full bg-neutral-300" />
        <span className="ml-auto h-5 w-24 rounded-md bg-neutral-100" />
      </div>
      <div className="grid grid-cols-3 gap-3 pt-4">
        {[
          ["To review", 3],
          ["In progress", 4],
          ["Complete", 2],
        ].map(([title, count]) => (
          <div key={title as string} className="rounded-lg bg-neutral-50 p-2">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-medium text-neutral-500">{title}</span>
              <span className="text-[10px] text-neutral-400">{count}</span>
            </div>
            {Array.from({ length: count as number }).map((_, index) => (
              <div key={index} className="mb-2 rounded-md border border-neutral-200 bg-white p-2">
                <div className="h-2 w-full rounded bg-neutral-100" />
                <div className="mt-2 h-2 w-2/3 rounded bg-neutral-100" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export const LandingPageFeatures = () => {
  return (
    <section className="w-full bg-white py-24 md:py-36">
      <div className="mx-auto max-w-7xl space-y-28 px-6 md:space-y-40 md:px-8">
        {features.map((feature, index) => (
          <article
            key={feature.number}
            className={`flex flex-col items-center gap-12 md:gap-20 ${
              index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
            }`}
          >
            <div className="w-full flex-1">
              <p className="text-sm font-medium text-neutral-400">
                <span>{feature.number}</span> <span className="ml-2 text-black">{feature.label} →</span>
              </p>
              <h2 className="mt-5 max-w-xl text-3xl font-semibold tracking-tight text-black md:text-5xl">
                {feature.title}
              </h2>
              <p className="mt-5 max-w-lg text-lg leading-8 text-neutral-500">
                {feature.description}
              </p>
            </div>

            <div className="w-full flex-1 rounded-3xl bg-neutral-50 p-4 md:p-8">
              {feature.image ? (
                <Image
                  src="/dashboard_image.jpg"
                  alt="Frameport project workspace"
                  width={1200}
                  height={800}
                  className="h-auto w-full rounded-xl border border-neutral-200 shadow-lg shadow-neutral-200/50"
                />
              ) : (
                <WorkspaceMockup />
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
