export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="skeleton h-9 w-2/3 max-w-md" />
        <div className="skeleton h-4 w-1/2 max-w-sm" />
      </div>
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-28 w-full" />
        ))}
      </div>
    </div>
  );
}
