const values = [
  {
    figure: "FIG 0.1",
    title: "One clear workspace",
    description:
      "Keep every conversation, deliverable, and decision connected to the work it belongs to.",
  },
  {
    figure: "FIG 0.2",
    title: "Built for client work",
    description:
      "Give clients the context they need without exposing the noise your team does not.",
  },
  {
    figure: "FIG 0.3",
    title: "Designed for momentum",
    description:
      "Turn approvals and feedback into the next action, so projects keep moving forward.",
  },
];

export const LandingPageValueProps = () => {
  return (
    <section className="w-full border-y border-neutral-200 bg-neutral-50 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-neutral-500">
            A better way to work together
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-black md:text-5xl">
            The system behind your best client relationships.
          </h2>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {values.map((value) => (
            <article
              key={value.figure}
              className="rounded-2xl border border-neutral-200 bg-white p-7 md:p-8"
            >
              <p className="text-xs font-semibold tracking-[0.2em] text-neutral-400 uppercase">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  {value.figure}
                </div>
              </p>
              <h3 className="mt-6 text-xl font-semibold text-black">
                {value.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-neutral-500">
                {value.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
