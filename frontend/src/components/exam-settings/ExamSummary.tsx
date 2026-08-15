interface ExamSummaryProps {
  selectedQuestions: number;
  timed: boolean;
  duration: number;
}

export default function ExamSummary({
  selectedQuestions,
  timed,
  duration,
}: ExamSummaryProps) {

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">

      <h2 className="text-xl font-semibold text-white">
        Exam Summary
      </h2>

      <p className="mt-2 text-sm text-zinc-400">
        Review your exam configuration before starting.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">

        <SummaryCard
          label="Questions"
          value={`${selectedQuestions}`}
        />

        <SummaryCard
          label="Mode"
          value={timed ? "Timed" : "Practice"}
        />

        <SummaryCard
          label="Duration"
          value={timed ? `${duration} min` : "Unlimited"}
        />

      </div>

    </section>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
}

function SummaryCard({
  label,
  value,
}: SummaryCardProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">

      <p className="text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold text-white">
        {value}
      </p>

    </div>
  );
}