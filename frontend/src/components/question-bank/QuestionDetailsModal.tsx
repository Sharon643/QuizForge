import { useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import type { QuestionSummary } from "../../types/questionBank";

interface QuestionDetailsModalProps {
  question: QuestionSummary | null;
  open: boolean;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  onClose: () => void;
  onEditAnswer?: (
    question: QuestionSummary
  ) => void;
}

export default function QuestionDetailsModal({
  question,
  open,
  hasPrevious = false,
  hasNext = false,
  onPrevious,
  onNext,
  onClose,
  onEditAnswer,
}: QuestionDetailsModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!open) return;

      switch (event.key) {
        case "Escape":
          onClose();
          break;

        case "ArrowLeft":
          if (hasPrevious && onPrevious) {
            onPrevious();
          }
          break;

        case "ArrowRight":
          if (hasNext && onNext) {
            onNext();
          }
          break;
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [
    open,
    hasPrevious,
    hasNext,
    onPrevious,
    onNext,
    onClose,
  ]);

  if (!open || !question) {
    return null;
  }

  const answered =
    !!question.correct_answer;

  const source = question.answer_source;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
      >
        {/* Header */}

        <div className="flex items-center justify-between border-b border-zinc-800 px-8 py-6">

          <div>

            <p className="text-sm text-zinc-500">
              Question #{question.number}
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              {question.subject ??
                "General"}
            </h2>

          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X size={22} />
          </button>

        </div>

        {/* Body */}

        <div className="flex-1 space-y-8 overflow-y-auto p-8">

          {/* Question */}

          <section>

            <h3 className="mb-4 text-lg font-semibold text-white">
              Question
            </h3>

            <p className="leading-8 text-zinc-100">
              {question.question}
            </p>

          </section>

          {/* Options */}

          <section>

            <h3 className="mb-4 text-lg font-semibold text-white">
              Options
            </h3>

            <div className="space-y-3">

              {Object.entries(
                question.options
              ).map(([key, value]) => {

                const correct =
                  answered &&
                  key ===
                    question.correct_answer;

                return (
                  <div
                    key={key}
                    className={`rounded-xl border p-5 transition ${
                      correct
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-zinc-800 bg-zinc-950"
                    }`}
                  >
                    <div className="flex items-center justify-between">

                      <div>

                        <span className="font-bold text-zinc-300">
                          {key}.
                        </span>

                        <span className="ml-3 text-zinc-200">
                          {value}
                        </span>

                      </div>

                      {correct && (
                        <CheckCircle2
                          size={20}
                          className="text-emerald-400"
                        />
                      )}

                    </div>

                  </div>
                );
              })}

            </div>

          </section>

          {/* Answer */}

          <section>

            <h3 className="mb-4 text-lg font-semibold text-white">
              Answer
            </h3>

            {answered ? (

              <div className="rounded-xl border border-emerald-700 bg-emerald-950/20 p-6">

                <div className="flex items-center gap-4">

                  <div className="rounded-lg bg-emerald-500 px-5 py-2 text-2xl font-bold text-black">
                    {question.correct_answer}
                  </div>

                  <div>

                    <div className="flex items-center gap-2">

                      {source === "official" && (
                          <span className="font-medium text-emerald-400">
                              📘 Official Answer
                          </span>
                      )}

                      {source === "ai" && (
                          <span className="font-medium text-blue-400">
                              🤖 AI Generated
                          </span>
                      )}

                      {source === "manual" && (
                          <span className="font-medium text-yellow-400">
                              ✏️ Manually Edited
                          </span>
                      )}

                    </div>

                    {source === "ai" &&
                  question.confidence != null && (
                        <p className="mt-2 text-sm text-zinc-400">
                          Confidence:{" "}
                          {(
                            question.confidence *
                            100
                          ).toFixed(1)}
                          %
                        </p>
                      )}

                  </div>

                </div>

                {question.explanation && (

                  <div className="mt-6 border-t border-zinc-700 pt-5">

                    <h4 className="mb-2 font-semibold text-white">
                      Explanation
                    </h4>

                    <p className="leading-7 text-zinc-300">
                      {
                        question.explanation
                      }
                    </p>

                  </div>

                )}

              </div>

            ) : (

              <div className="rounded-xl border border-amber-700 bg-amber-950/20 p-6">

                <div className="flex items-start gap-3">

                  <AlertTriangle
                    size={22}
                    className="mt-1 text-amber-400"
                  />

                  <div>

                    <h4 className="font-semibold text-amber-300">
                      No Answer Available
                    </h4>

                    <p className="mt-2 leading-7 text-zinc-300">
                      This question does not
                      currently have an
                      official or AI-generated
                      answer.

                    </p>

                  </div>

                </div>

              </div>

            )}

            <div className="mt-6 flex justify-end">

              <button
                  onClick={() =>
                      onEditAnswer?.(question)
                  }
                  className="
                      rounded-lg
                      bg-blue-600
                      px-5
                      py-2
                      text-white
                      hover:bg-blue-500
                  "
              >
                  {answered
                      ? "Edit Answer"
                      : "Add Answer"}
              </button>

          </div>

          </section>

        </div>

        {/* Footer */}

        <div className="flex items-center justify-between border-t border-zinc-800 px-8 py-5">

          <button
            disabled={!hasPrevious}
            onClick={onPrevious}
            className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          <button
            disabled={!hasNext}
            onClick={onNext}
            className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight size={18} />
          </button>

        </div>

      </div>

    </div>
  );
}