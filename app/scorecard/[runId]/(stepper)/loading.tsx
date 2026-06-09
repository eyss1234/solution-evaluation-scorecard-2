export default function Loading() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
      <div className="hidden shrink-0 lg:block lg:w-96">
        <div className="skeleton h-[28rem] w-full" />
      </div>
      <div className="min-w-0 flex-1 space-y-6">
        <div className="space-y-2">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-8 w-1/2 max-w-sm" />
          <div className="skeleton h-4 w-2/3 max-w-md" />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-32 w-full" />
        ))}
      </div>
    </div>
  );
}
