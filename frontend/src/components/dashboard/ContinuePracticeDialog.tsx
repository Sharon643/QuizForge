interface ContinuePracticeDialogProps {
  open: boolean;
  practice: any;
  onContinue: () => void;
  onStartNew: () => void;
  onClose: () => void;
}

export default function ContinuePracticeDialog({
  open,
  practice,
  onContinue,
  onStartNew,
  onClose,
}: ContinuePracticeDialogProps) {
  if (!open || !practice) {
    return null;
  }

  const progress =
    practice.questionCount > 0
      ? Math.round(
          (practice.answered /
            practice.questionCount) *
            100
        )
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white">
          Continue Practice?
        </h2>

        <p className="mt-3 text-zinc-400">
          You already have an unfinished practice
          session.
        </p>

        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">
              Question Bank
            </span>

            <span className="font-medium text-white">
              {practice.questionBank}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-zinc-400">
              Progress
            </span>

            <span className="font-medium text-white">
              {practice.answered} /{" "}
              {practice.questionCount}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-zinc-400">
              Completion
            </span>

            <span className="font-medium text-blue-400">
              {progress}%
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-zinc-400">
              Started
            </span>

            <span className="font-medium text-white">
              {new Date(
                practice.startedAt
              ).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-700 px-5 py-2 text-zinc-300 transition hover:border-zinc-600"
          >
            Cancel
          </button>

          <button
            onClick={onStartNew}
            className="rounded-lg bg-zinc-700 px-5 py-2 font-medium text-white transition hover:bg-zinc-600"
          >
            Start New
          </button>

          <button
            onClick={onContinue}
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-500"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}