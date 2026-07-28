import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import type { PracticeSession } from "../types/practice";

import {
  getPractice,
  submitPracticeAnswer,
  finishPractice,
} from "../services/practiceService";

import ExamHeader from "../components/exam/ExamHeader";
import QuestionPanel from "../components/exam/QuestionPanel";
import QuestionNavigator from "../components/exam/QuestionNavigator";
import PracticeSkeleton from "../components/practice/PracticeSkeleton";


export default function Practice() {
  const { practiceId } = useParams();
  const navigate = useNavigate();

  const [practice, setPractice] =
    useState<PracticeSession | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    currentQuestionIndex,
    setCurrentQuestionIndex,
  ] = useState(0);

  const [answers, setAnswers] = useState<
    Record<string, string | null>
  >({});

  // Stores whether each answered question
  // was correct or incorrect.
  const [results, setResults] = useState<
    Record<string, boolean>
  >({});

  const [
    visitedQuestions,
    setVisitedQuestions,
  ] = useState<Set<number>>(
    new Set([1])
  );

  // ---------- Practice Feedback ----------

  const [showFeedback, setShowFeedback] =
    useState(false);

  const [
    correctAnswer,
    setCorrectAnswer,
  ] = useState("");

  const [
    answerCorrect,
    setAnswerCorrect,
  ] = useState(false);

  const [
    explanation,
    setExplanation,
  ] = useState("");

  // ---------------------------------------

  useEffect(() => {
    async function loadPractice() {
      if (!practiceId) {
        setError(
          "Invalid practice session."
        );
        setLoading(false);
        return;
      }

      try {
        const session =
          await getPractice(practiceId);

        setPractice(session);

        const restoredAnswers: Record<
          string,
          string | null
        > = {};

        const restoredVisited =
          new Set<number>([1]);
          
        const restoredResults: Record<
            string,
            boolean
        > = {};
      session.questions.forEach(
          (question, index) => {

              const answer =
                  session.answers?.[
                      question.id
                  ];

              if (!answer) return;

              if (answer.selectedOption) {

                  restoredAnswers[
                      question.id
                  ] =
                      answer.selectedOption;

                  restoredVisited.add(
                      index + 1
                  );

              }

              if (
                  answer.isCorrect !==
                  null &&
                  answer.isCorrect !==
                  undefined
              ) {

                  restoredResults[
                      question.id
                  ] =
                      answer.isCorrect;

              }

          }
      );

        setAnswers(
          restoredAnswers
        );

        setResults(
            restoredResults
        );

        setVisitedQuestions(
          restoredVisited
        );

      } catch (err) {
        console.error(err);

        setError(
          "Failed to load practice."
        );

      } finally {
        setLoading(false);
      }
    }

    loadPractice();

  }, [practiceId]);

  // ---------- Current Question ----------

  const currentQuestion =
    useMemo(() => {
      if (!practice) {
        return null;
      }

      return practice.questions[
        currentQuestionIndex
      ];

    }, [
      practice,
      currentQuestionIndex,
    ]);

  // ---------- Answered Questions ----------

  const answeredQuestions =
    useMemo(() => {
      if (!practice) {
        return new Set<number>();
      }

      const answered =
        new Set<number>();

      practice.questions.forEach(
        (question, index) => {
          if (
            answers[question.id]
          ) {
            answered.add(
              index + 1
            );
          }
        }
      );

      return answered;

    }, [
      answers,
      practice,
    ]);

  // ---------- Correct / Wrong Counts ----------

  const correctCount =
    useMemo(() => {
      return Object.values(
        results
      ).filter(
        (value) =>
          value === true
      ).length;

    }, [results]);

  const wrongCount =
    useMemo(() => {
      return Object.values(
        results
      ).filter(
        (value) =>
          value === false
      ).length;

    }, [results]);

  // ---------- Submit Answer ----------

  async function handleSelectOption(
    option: string
  ) {
    if (
      !practice ||
      !currentQuestion
    ) {
      return;
    }

    // Prevent answering the same
    // question again after feedback.
    if (showFeedback) {
      return;
    }

    setAnswers(
      (previous) => ({
        ...previous,

        [currentQuestion.id]:
          option,
      })
    );

    try {
      const feedback =
        await submitPracticeAnswer(
          practice.practiceId,
          currentQuestion.id,
          option,
        );

      // Store result for this
      // specific question.
      setResults(
        (previous) => ({
          ...previous,

          [currentQuestion.id]:
            feedback.correct,
        })
      );

      setCorrectAnswer(
        feedback.correctAnswer
      );

      setAnswerCorrect(
        feedback.correct
      );

      setExplanation(
        feedback.explanation ??
          ""
      );

      setShowFeedback(true);

    } catch (err) {
      console.error(
        "Failed to submit practice answer:",
        err
      );
    }
  }

  // ---------- Previous Question ----------

  function handlePrevious() {
    const previousIndex =
      Math.max(
        currentQuestionIndex - 1,
        0
      );

    setCurrentQuestionIndex(
      previousIndex
    );

    setShowFeedback(false);

    setVisitedQuestions(
      (previous) => {
        const updated =
          new Set(previous);

        updated.add(
          previousIndex + 1
        );

        return updated;
      }
    );
  }

  // ---------- Next Question ----------

  function handleNext() {
    if (!practice) return;

    const nextIndex =
      Math.min(
        currentQuestionIndex + 1,
        practice.questionCount - 1
      );

    setCurrentQuestionIndex(
      nextIndex
    );

    setShowFeedback(false);

    setVisitedQuestions(
      (previous) => {
        const updated =
          new Set(previous);

        updated.add(
          nextIndex + 1
        );

        return updated;
      }
    );
  }

  // ---------- Navigator ----------

  function handleQuestionSelect(
    questionNumber: number
  ) {
    setCurrentQuestionIndex(
      questionNumber - 1
    );

    setShowFeedback(false);

    setVisitedQuestions(
      (previous) => {
        const updated =
          new Set(previous);

        updated.add(
          questionNumber
        );

        return updated;
      }
    );
  }

  // ---------- Finish Practice ----------

  async function handleFinishPractice() {
    if (!practice) return;

    try {
      const result =
        await finishPractice(
          practice.practiceId
        );

      navigate(
        "/practice/result",
        {
          state: result,
        }
      );

    } catch (err) {
      console.error(
        "Failed to finish practice:",
        err
      );
    }
  }

  // ---------- Loading ----------

  if (loading) {
    return <PracticeSkeleton />;
  }

  // ---------- Error ----------

  if (
    error ||
    !practice ||
    !currentQuestion
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-red-400">
          {error ||
            "Practice session not found"}
        </p>
      </main>
    );
  }

  // ---------- UI ----------

  return (
    <main className="min-h-screen bg-zinc-950">

      <div className="mx-auto max-w-[1800px] px-8 py-8">

        <ExamHeader
          current={
            currentQuestionIndex + 1
          }
          total={
            practice.questionCount
          }
          answered={
            answeredQuestions.size
          }
          timed={false}
          remainingSeconds={null}
          onExit={() =>
            navigate(
              "/dashboard"
            )
          }
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">

          {/* LEFT */}

          <section>

            <QuestionPanel
              practiceMode

              showFeedback={
                showFeedback
              }

              correctAnswer={
                correctAnswer
              }

              answerCorrect={
                answerCorrect
              }

              explanation={
                explanation
              }

              currentQuestion={
                currentQuestionIndex + 1
              }

              question={
                currentQuestion
              }

              selectedOption={
                answers[
                  currentQuestion.id
                ] ?? null
              }

              hasPrevious={
                currentQuestionIndex >
                0
              }

              hasNext={
                currentQuestionIndex <
                practice.questionCount -
                  1
              }

              isMarkedForReview={
                false
              }

              onSelectOption={
                handleSelectOption
              }

              onPrevious={
                handlePrevious
              }

              onNext={
                handleNext
              }

              onMarkReview={() => {}}
            />

          </section>

          {/* RIGHT */}

          <aside className="sticky top-8 self-start space-y-6">

            <QuestionNavigator
              total={
                practice.questionCount
              }

              current={
                currentQuestionIndex + 1
              }

              answered={
                answeredQuestions
              }

              review={
                new Set<number>()
              }

              visited={
                visitedQuestions
              }

              onSelect={
                handleQuestionSelect
              }
            />

            {/* Practice Progress */}

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">

              <h3 className="text-lg font-semibold text-white">
                Practice Progress
              </h3>

              <div className="mt-6 space-y-5">

                {/* Correct */}

                <div className="flex items-center justify-between">

                  <span className="text-zinc-400">
                    Correct
                  </span>

                  <span className="font-semibold text-emerald-400">
                    {correctCount}
                  </span>

                </div>

                {/* Wrong */}

                <div className="flex items-center justify-between">

                  <span className="text-zinc-400">
                    Wrong
                  </span>

                  <span className="font-semibold text-red-400">
                    {wrongCount}
                  </span>

                </div>

                {/* Remaining */}

                <div className="flex items-center justify-between">

                  <span className="text-zinc-400">
                    Remaining
                  </span>

                  <span className="font-semibold text-white">
                    {practice.questionCount -
                      answeredQuestions.size}
                  </span>

                </div>

              </div>

            </div>

            {/* Finish */}

            <button
              onClick={
                handleFinishPractice
              }
              className="
                w-full
                rounded-lg
                bg-blue-600
                py-3
                font-medium
                text-white
                transition
                hover:bg-blue-500
              "
            >
              Finish Practice
            </button>

          </aside>

        </div>

      </div>

    </main>
  );
}