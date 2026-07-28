import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PracticeSettingsSkeleton from "../components/practice/PracticeSettingsSkeleton";

import { startPractice } from "../services/practiceService";

import {
  getQuestionBanks,
  type QuestionBank,
} from "../services/questionBank";

export default function PracticeSettings() {
  const navigate = useNavigate();

  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [selectedBank, setSelectedBank] = useState("");

  const [questionCount, setQuestionCount] = useState(25);

  const [loading, setLoading] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    loadQuestionBanks();
  }, []);

  async function loadQuestionBanks() {
    try {
      setLoadingBanks(true);

        const response = await getQuestionBanks();

        const data = response.banks;

        setBanks(data);

        const active = data.find(
            (bank: QuestionBank) => bank.active
        );

      if (active) {
        setSelectedBank(active.id);
      } else if (data.length > 0) {
        setSelectedBank(data[0].id);
      }
    } catch (err) {
      console.error(err);

      setError(
        "Failed to load question banks."
      );
    } finally {
      setLoadingBanks(false);
    }
  }

  async function handleStartPractice() {
    try {
      setLoading(true);
      setError("");

      const session =
        await startPractice(
          questionCount,
          selectedBank,
        );

      navigate(
        `/practice/${session.practiceId}`,
      );
    } catch (err) {
      console.error(err);

      setError(
        "Failed to start practice session."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loadingBanks) {
      return <PracticeSettingsSkeleton />;
  }

  if (banks.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
        <div className="max-w-lg text-center">

          <h1 className="text-3xl font-bold text-white">
            No Question Banks Found
          </h1>

          <p className="mt-4 text-zinc-400">
            Upload and extract a PDF before
            starting Practice Mode.
          </p>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-3xl px-8 py-12">

        <h1 className="text-4xl font-bold text-white">
          Practice Mode
        </h1>

        <p className="mt-3 text-zinc-400">
          Practice questions with instant
          feedback and explanations.
        </p>

        <section className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-8">

          <div className="space-y-6">

            <div>

              <label className="mb-3 block text-sm font-medium text-zinc-300">
                Question Bank
              </label>

              <select
                value={selectedBank}
                onChange={(e) =>
                  setSelectedBank(
                    e.target.value,
                  )
                }
                className="
                  w-full
                  rounded-lg
                  border
                  border-zinc-700
                  bg-zinc-900
                  px-4
                  py-3
                  text-white
                  outline-none
                  focus:border-blue-500
                "
              >
                {banks.map((bank) => (
                <option
                key={bank.id}
                value={bank.id}
                >
                {bank.fileName} ({bank.questionCount} qns)
                </option>
                ))}
              </select>

            </div>

            <div>

              <label className="mb-3 block text-sm font-medium text-zinc-300">
                Number of Questions
              </label>

              <select
                value={questionCount}
                onChange={(e) =>
                  setQuestionCount(
                    Number(e.target.value),
                  )
                }
                className="
                  w-full
                  rounded-lg
                  border
                  border-zinc-700
                  bg-zinc-900
                  px-4
                  py-3
                  text-white
                  outline-none
                  focus:border-blue-500
                "
              >
                <option value={10}>
                  10 Questions
                </option>

                <option value={25}>
                  25 Questions
                </option>

                <option value={50}>
                  50 Questions
                </option>

                <option value={75}>
                  75 Questions
                </option>

                <option value={100}>
                  100 Questions
                </option>

              </select>

            </div>

          </div>

          {error && (
            <p className="mt-6 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            onClick={handleStartPractice}
            disabled={
              loading ||
              !selectedBank
            }
            className="
              mt-8
              w-full
              rounded-xl
              bg-blue-600
              py-3
              text-lg
              font-semibold
              text-white
              transition
              hover:bg-blue-500
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
        {loading ? "Starting..." : "Start Practice"}
          </button>

        </section>

      </div>
    </main>
  );
}