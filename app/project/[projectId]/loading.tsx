export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="skeleton h-4 w-24" />
      <div className="space-y-2">
        <div className="skeleton h-9 w-1/2 max-w-sm" />
        <div className="skeleton h-4 w-40" />
      </div>
      <div className="skeleton h-24 w-full" />
      <div className="skeleton h-64 w-full" />
    </div>
  );
}
