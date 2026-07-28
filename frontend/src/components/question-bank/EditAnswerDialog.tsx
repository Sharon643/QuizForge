import { useEffect, useState } from "react";
import type { QuestionSummary } from "../../types/questionBank";
import { updateAnswer } from "../../services/questionBank";

interface Props {
  open: boolean;
  question: QuestionSummary | null;
  onClose: () => void;
  onSaved: (question: QuestionSummary) => void;
}

export default function EditAnswerDialog({
  open,
  question,
  onClose,
  onSaved,
}: Props) {
  const [answer, setAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!question) return;

    setAnswer(question.correct_answer ?? "");
    setExplanation(question.explanation ?? "");
  }, [question]);

  if (!open || !question) {
    return null;
  }
  const currentQuestion = question;

  async function handleSave() {
    if (!answer) {
      alert("Please select an answer.");
      return;
    }

    try {
      setSaving(true);

    const updated = await updateAnswer(
        currentQuestion.id,
        answer,
        explanation
    );

      onSaved(updated);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save answer.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white">
          Edit Answer
        </h2>

        <p className="mt-2 text-zinc-400">
          Question #{question.number}
        </p>

        <div className="mt-8 space-y-3">
          {["A", "B", "C", "D"].map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-800 p-4 hover:border-zinc-700"
            >
              <input
                type="radio"
                value={option}
                checked={answer === option}
                onChange={(e) =>
                  setAnswer(e.target.value)
                }
              />

              <span className="font-semibold">
                {option}
              </span>

              <span className="text-zinc-300">
                {
                  question.options[
                    option as keyof typeof question.options
                  ]
                }
              </span>
            </label>
          ))}
        </div>

        <div className="mt-8">
          <label className="mb-2 block text-sm font-medium text-white">
            Explanation
          </label>

          <textarea
            value={explanation}
            onChange={(e) =>
              setExplanation(e.target.value)
            }
            rows={6}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-white outline-none focus:border-blue-500"
          />
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-700 px-5 py-2 text-zinc-300"
          >
            Cancel
          </button>

          <button
            disabled={saving}
            onClick={handleSave}
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}