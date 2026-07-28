import Skeleton from "../ui/Skeleton";

export default function PracticeSettingsSkeleton() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-3xl px-8 py-12">

        <Skeleton className="h-10 w-56" />
        <Skeleton className="mt-3 h-5 w-96" />

        <section className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-8">

          <div className="space-y-8">

            <div>
              <Skeleton className="mb-3 h-4 w-32" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>

            <div>
              <Skeleton className="mb-3 h-4 w-40" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>

          </div>

          <Skeleton className="mt-8 h-12 w-full rounded-xl" />

        </section>

      </div>
    </main>
  );
}