import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import type {
  QuestionBank,
  QuestionSummary,
} from "../types/questionBank";

import {
  getQuestionBanks,
  getQuestionBankQuestions,
  selectQuestionBank,
  deleteQuestionBank,
} from "../services/questionBank";

import QuestionBankHeader from "../components/question-bank/QuestionBankHeader";
import QuestionBankCard from "../components/question-bank/QuestionBankCard";
import QuestionBankInfo from "../components/question-bank/QuestionBankInfo";
import QuestionSearch from "../components/question-bank/QuestionSearch";
import QuestionCard from "../components/question-bank/QuestionCard";
import QuestionBankSkeleton from "../components/question-bank/QuestionBankSkeleton";
import QuestionDetailsModal from "../components/question-bank/QuestionDetailsModal";

export default function QuestionBank() {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [selectedBank, setSelectedBank] =
    useState<QuestionBank | null>(null);

  const [questions, setQuestions] = useState<QuestionSummary[]>([]);

  const [selectedQuestion, setSelectedQuestion] =
    useState<QuestionSummary | null>(null);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<
  "all" | "official" | "ai" | "missing" >("all");

  const [loading, setLoading] = useState(true);

  const [loadingQuestions, setLoadingQuestions] =
    useState(false);

  const [error, setError] = useState("");

  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadBanks();
  }, []);
  useEffect(() => {

  const urlFilter =
    searchParams.get("filter");

  if (
    urlFilter === "official" ||
    urlFilter === "ai" ||
    urlFilter === "missing"
  ) {

    setFilter(urlFilter);

  } else {

    setFilter("all");

  }

}, [searchParams]);

  async function loadBanks() {
    try {
      setLoading(true);

      const response =
        await getQuestionBanks();

      setBanks(response.banks);
    } catch (err) {
      console.error(err);
      setError(
        "Failed to load question banks."
      );
    } finally {
      setLoading(false);
    }
  }

  async function openBank(
    bank: QuestionBank
  ) {
    try {
      setLoadingQuestions(true);

      setSelectedBank(bank);

      const response =
        await getQuestionBankQuestions(
          bank.id
        );

      setQuestions(response.questions);

      setSearch("");

      setSelectedQuestion(null);
    } catch (err) {
      console.error(err);

      setError(
        "Failed to load questions."
      );
    } finally {
      setLoadingQuestions(false);
    }
  }

  async function handleMakeActive() {
    if (!selectedBank) return;

    await selectQuestionBank(
      selectedBank.id
    );

    await loadBanks();

    setSelectedBank({
      ...selectedBank,
      active: true,
    });
  }

  async function handleDelete() {
    if (!selectedBank) return;

    const confirmed = window.confirm(
      `Delete "${selectedBank.fileName}"?`
    );

    if (!confirmed) return;

    await deleteQuestionBank(
      selectedBank.id
    );

    setSelectedBank(null);

    setQuestions([]);

    await loadBanks();
  }
  const counts = useMemo(() => ({

    all: questions.length,

    official: questions.filter(
      q => q.answer_source === "official"
    ).length,

    ai: questions.filter(
      q => q.answer_source === "ai"
    ).length,

    missing: questions.filter(
      q => !q.correct_answer
    ).length,

  }), [questions]);

  const filteredQuestions = useMemo(() => {

    let filtered = [...questions];

    switch (filter) {

      case "official":
        filtered = filtered.filter(
          q => q.answer_source === "official"
        );
        break;

      case "ai":
        filtered = filtered.filter(
          q => q.answer_source === "ai"
        );
        break;

      case "missing":
        filtered = filtered.filter(
          q => !q.correct_answer
        );
        break;

    }

    if (!search.trim()) {
      return filtered;
    }

    const query = search.toLowerCase();

    return filtered.filter(
      question =>
        question.question
          .toLowerCase()
          .includes(query) ||

        question.subject
          ?.toLowerCase()
          .includes(query)
    );

  }, [questions, search, filter]);

  const currentIndex =
    selectedQuestion
      ? filteredQuestions.findIndex(
          (q) =>
            q.id === selectedQuestion.id
        )
      : -1;

  const hasPrevious =
    currentIndex > 0;

  const hasNext =
    currentIndex >= 0 &&
    currentIndex <
      filteredQuestions.length - 1;

  function handlePrevious() {
    if (hasPrevious) {
      setSelectedQuestion(
        filteredQuestions[
          currentIndex - 1
        ]
      );
    }
  }

  function handleNext() {
    if (hasNext) {
      setSelectedQuestion(
        filteredQuestions[
          currentIndex + 1
        ]
      );
    }
  }

  if (loading) {
    return <QuestionBankSkeleton />;
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-red-400">
          {error}
        </p>
      </main>
    );
  }

    return (
    <>
      <main className="min-h-screen bg-zinc-950">
        <div className="mx-auto max-w-7xl px-8 py-8">

          <QuestionBankHeader />

          {!selectedBank ? (
            <>
              <section className="mb-8">

                <h2 className="text-3xl font-bold text-white">
                  Question Banks
                </h2>

                <p className="mt-2 text-zinc-400">
                  Select a question bank to browse its questions.
                </p>

              </section>

              <div className="grid gap-6">

                {banks.length === 0 ? (

                  <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-10 text-center">

                    <h3 className="text-xl font-semibold text-white">
                      No Question Banks
                    </h3>

                    <p className="mt-3 text-zinc-400">
                      Upload a PDF to create your first question bank.
                    </p>

                  </div>

                ) : (

                  banks.map((bank) => (

                    <QuestionBankCard
                      key={bank.id}
                      bank={bank}
                      onOpen={() => openBank(bank)}
                    />

                  ))

                )}

              </div>

            </>
          ) : (
            <>
              <div className="mb-8 flex items-center justify-between">

                <div>

                  <button
                    onClick={() => {
                      setSelectedBank(null);
                      setQuestions([]);
                    }}
                    className="mb-3 text-sm text-blue-400 hover:text-blue-300"
                  >
                    ← Back to Question Banks
                  </button>

                  <h2 className="text-3xl font-bold text-white">
                    {selectedBank.fileName}
                  </h2>

                  <p className="mt-2 text-zinc-400">
                    {selectedBank.questionCount} Questions
                  </p>

                </div>

                <div className="flex gap-3">

                  {!selectedBank.active && (

                    <button
                      onClick={handleMakeActive}
                      className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
                    >
                      Make Active
                    </button>

                  )}

                  <button
                    onClick={handleDelete}
                    className="rounded-lg border border-red-500 px-5 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                  >
                    Delete
                  </button>

                </div>

              </div>

              <QuestionBankInfo metadata={selectedBank} />

              <div className="mt-8">

                <div className="space-y-5">

                  <div className="flex flex-wrap gap-3">

                    <button
                      onClick={() => setFilter("all")}
                      className={filter === "all"
                        ? "rounded-full bg-blue-600 px-4 py-2 text-white"
                        : "rounded-full bg-zinc-800 px-4 py-2 text-zinc-300"}
                    >
                      All ({counts.all})
                    </button>

                    <button
                      onClick={() => setFilter("official")}
                      className={filter === "official"
                        ? "rounded-full bg-blue-600 px-4 py-2 text-white"
                        : "rounded-full bg-zinc-800 px-4 py-2 text-zinc-300"}
                    >
                      Official ({counts.official})
                    </button>

                    <button
                      onClick={() => setFilter("ai")}
                      className={filter === "ai"
                        ? "rounded-full bg-blue-600 px-4 py-2 text-white"
                        : "rounded-full bg-zinc-800 px-4 py-2 text-zinc-300"}
                    >
                      AI ({counts.ai})
                    </button>

                    <button
                      onClick={() => setFilter("missing")}
                      className={filter === "missing"
                        ? "rounded-full bg-blue-600 px-4 py-2 text-white"
                        : "rounded-full bg-zinc-800 px-4 py-2 text-zinc-300"}
                    >
                      Missing ({counts.missing})
                    </button>

                  </div>

                  <QuestionSearch
                    value={search}
                    onChange={setSearch}
                  />

                </div>

              </div>

              <section className="mt-8 space-y-6">

                {loadingQuestions ? (

                  <QuestionBankSkeleton />

                ) : filteredQuestions.length === 0 ? (

                  <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-10 text-center">

                    <p className="text-zinc-400">
                      No questions found.
                    </p>

                  </div>

                ) : (

                  filteredQuestions.map((question) => (

                    <QuestionCard
                      key={question.id}
                      question={question}
                      onView={setSelectedQuestion}
                    />

                  ))

                )}

              </section>
            </>
          )}

        </div>
      </main>

      <QuestionDetailsModal
        open={selectedQuestion !== null}
        question={selectedQuestion}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onClose={() => setSelectedQuestion(null)}
      />
    </>
  );
}