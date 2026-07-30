import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ReviewHeader from "../components/review/ReviewHeader";
import ReviewSummary from "../components/review/ReviewSummary";
import ReviewFilter from "../components/review/ReviewFilter";
import ReviewNavigator from "../components/review/ReviewNavigator";
import ReviewQuestion from "../components/review/ReviewQuestion";
import ReviewControls from "../components/review/ReviewControls";
import ReviewSkeleton from "../components/review/ReviewSkeleton";

import { getReview } from "../services/reviewService";

import type { ReviewResponse } from "../types/review";

type FilterType =
  | "All"
  | "Correct"
  | "Wrong"
  | "Skipped"
  | "Marked";

export default function Review() {
  const { examId } = useParams();

  const navigate = useNavigate();

  const [review, setReview] =
    useState<ReviewResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [filter, setFilter] =
    useState<FilterType>("All");

  const [currentIndex, setCurrentIndex] =
    useState(0);

  useEffect(() => {
    async function loadReview() {

      if (!examId) {
        setError("Invalid Exam");
        setLoading(false);
        return;
      }

      try {

        const data =
          await getReview(examId);

        setReview(data);

      } catch (err) {

        console.error(err);

        setError(
          "Failed to load review."
        );

      } finally {

        setLoading(false);

      }

    }

    loadReview();

  }, [examId]);

  const filteredQuestions =
    useMemo(() => {

      if (!review)
        return [];

      return review.questions.filter(
        (question) => {

          switch (filter) {

            case "Correct":
              return question.isCorrect;

            case "Wrong":
              return (
                !question.isCorrect &&
                !question.isSkipped
              );

            case "Skipped":
              return question.isSkipped;

            case "Marked":
              return question.marked;

            default:
              return true;

          }

        }
      );

    }, [review, filter]);

  useEffect(() => {

    setCurrentIndex(0);

  }, [filter]);

  const currentQuestion =
    filteredQuestions[currentIndex];

  useEffect(() => {

    function handleKeyDown(
      event: KeyboardEvent
    ) {

      if (!filteredQuestions.length)
        return;

      if (
        event.key === "ArrowRight"
      ) {

        setCurrentIndex(
          (previous) =>
            Math.min(
              previous + 1,
              filteredQuestions.length - 1
            )
        );

      }

      if (
        event.key === "ArrowLeft"
      ) {

        setCurrentIndex(
          (previous) =>
            Math.max(
              previous - 1,
              0
            )
        );

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

  }, [filteredQuestions]);

  if (loading) {
      return <ReviewSkeleton />;
  }

  if (
    error ||
    !review
  ) {

    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950">

        <p className="text-red-400">
          {error}
        </p>

      </main>
    );

  }

    return (
    <main className="min-h-screen bg-zinc-950">

      <div className="mx-auto max-w-7xl space-y-8 px-8 py-10">

        <ReviewHeader
          onBack={() => navigate("/history")}
        />

        <ReviewSummary
          summary={review.summary}
        />

        <ReviewFilter
          selected={filter}
          onChange={setFilter}
        />

        {filteredQuestions.length === 0 ? (

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 py-24 text-center">

            <h2 className="text-2xl font-semibold text-white">
              No Questions Found
            </h2>

            <p className="mt-3 text-zinc-400">
              No questions match the selected filter.
            </p>

          </div>

        ) : (

          <>

            <ReviewNavigator
              questions={filteredQuestions}
              currentIndex={currentIndex}
              onSelect={setCurrentIndex}
            />

            <ReviewQuestion
              question={currentQuestion}
              index={currentQuestion.index}
              total={review.summary.questionCount}
            />

            <ReviewControls
              hasPrevious={currentIndex > 0}
              hasNext={
                currentIndex <
                filteredQuestions.length - 1
              }
              onPrevious={() =>
                setCurrentIndex((previous) =>
                  Math.max(previous - 1, 0)
                )
              }
              onNext={() =>
                setCurrentIndex((previous) =>
                  Math.min(
                    previous + 1,
                    filteredQuestions.length - 1
                  )
                )
              }
              onBack={() =>
                navigate("/history")
              }
            />

          </>

        )}

      </div>

    </main>
  );
}