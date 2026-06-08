export default function HomePage() {
  return (
    <div className="animate-fade-in space-y-10">
      <section className="space-y-4">
        <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
          Decision support
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Score solutions with confidence.
        </h1>
        <p className="max-w-2xl text-lg text-slate-600">
          Define the criteria that matter, weight them to your priorities, and
          compare candidate solutions on a single, transparent scale.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <a href="/solutions" className="btn-primary">
            Get started
          </a>
          <a href="/criteria" className="btn-secondary">
            Define criteria
          </a>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        {[
          {
            title: "Weighted criteria",
            body: "Assign relative importance to each dimension so scores reflect what matters.",
          },
          {
            title: "Transparent scoring",
            body: "Every overall score breaks down into its underlying criterion scores.",
          },
          {
            title: "Easy comparison",
            body: "Rank solutions side by side on a normalized 0–100 scale.",
          },
        ].map((feature) => (
          <div key={feature.title} className="card">
            <h2 className="text-base font-semibold text-slate-900">
              {feature.title}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{feature.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
