import Skeleton from "../ui/Skeleton";

export default function PracticeSkeleton() {
  return (
    <main className="min-h-screen bg-zinc-950">

      <div className="mx-auto max-w-[1800px] px-8 py-8">

        {/* Header */}

        <div className="mb-8 flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-44" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">

          {/* Left */}

          <section>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">

              <Skeleton className="h-8 w-24" />

              <div className="mt-8 space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-11/12" />
                <Skeleton className="h-6 w-9/12" />
              </div>

              <div className="mt-10 space-y-4">

                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />

              </div>

              <div className="mt-10 flex justify-between">

                <Skeleton className="h-11 w-28" />

                <Skeleton className="h-11 w-28" />

              </div>

            </div>

          </section>

          {/* Right */}

          <aside className="space-y-6">

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">

              <Skeleton className="h-6 w-36" />

              <div className="mt-6 grid grid-cols-5 gap-3">

                {Array.from({ length: 25 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="aspect-square"
                  />
                ))}

              </div>

            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">

              <Skeleton className="h-6 w-44" />

              <div className="mt-6 space-y-5">

                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />

              </div>

            </div>

            <Skeleton className="h-12 w-full" />

          </aside>

        </div>

      </div>

    </main>
  );
}