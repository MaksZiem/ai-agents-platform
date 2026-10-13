const SKELETON =
  "animate-pulse rounded-md bg-surface-2 motion-reduce:animate-none";

export default function Loading() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Loading…</span>
      <div className="border-b border-border px-6 py-5">
        <div className={`h-7 w-48 ${SKELETON}`} />
        <div className={`mt-2 h-4 w-80 max-w-full ${SKELETON}`} />
      </div>
      <div className="flex flex-col gap-4 p-6">
        <div className={`h-24 rounded-xl ${SKELETON}`} />
        <div className={`h-64 rounded-xl ${SKELETON}`} />
      </div>
    </div>
  );
}
