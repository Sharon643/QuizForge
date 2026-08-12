export default function HistorySkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-10 animate-pulse">

      {/* Header skeleton */}

      <div className="space-y-3">

        <div className="h-8 w-48 rounded-lg bg-zinc-800" />

        <div className="h-4 w-72 rounded bg-zinc-800" />

      </div>


      {/* Stats skeleton */}

      <div className="grid gap-4 md:grid-cols-3">

        <div className="h-24 rounded-xl bg-zinc-900" />

        <div className="h-24 rounded-xl bg-zinc-900" />

        <div className="h-24 rounded-xl bg-zinc-900" />

      </div>


      {/* Filter skeleton */}

      <div className="flex gap-4">

        <div className="h-10 flex-1 rounded-lg bg-zinc-900" />

        <div className="h-10 w-32 rounded-lg bg-zinc-900" />

      </div>


      {/* History cards */}

      <div className="grid gap-6">

        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="
              rounded-2xl
              border
              border-zinc-800
              bg-zinc-900
              p-6
            "
          >

            <div className="space-y-4">

              <div className="h-5 w-56 rounded bg-zinc-800" />

              <div className="h-4 w-40 rounded bg-zinc-800" />

              <div className="flex gap-4">

                <div className="h-4 w-24 rounded bg-zinc-800" />

                <div className="h-4 w-24 rounded bg-zinc-800" />

                <div className="h-4 w-24 rounded bg-zinc-800" />

              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}