import Skeleton from "../ui/Skeleton";

export default function ReviewSkeleton() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-7xl space-y-8 px-8 py-10">

        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-10 w-28" />
        </div>

        {/* Summary */}
        <div className="grid gap-6 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-4 h-8 w-16" />
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-10 w-24 rounded-full"
            />
          ))}
        </div>

        {/* Navigator */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-10 w-10 rounded-lg"
            />
          ))}
        </div>

        {/* Question */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <Skeleton className="h-6 w-40" />

          <div className="mt-8 space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-11/12" />
            <Skeleton className="h-6 w-8/12" />
          </div>

          <div className="mt-10 space-y-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between">
          <Skeleton className="h-11 w-32" />
          <Skeleton className="h-11 w-32" />
        </div>

      </div>
    </main>
  );
}