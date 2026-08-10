import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { QuestionBank } from "../types/questionBank";

import {
  getQuestionBanks,
} from "../services/questionBank";

import {
  generateExam,
  deleteExam,
} from "../services/examService";

import {
  getCached,
  setCached,
} from "../utils/apiCache";

import ExamSettingsHeader from "../components/exam-settings/ExamSettingsHeader";
import QuestionCountSelector from "../components/exam-settings/QuestionCountSelector";
import ExamSummary from "../components/exam-settings/ExamSummary";
import StartExamButton from "../components/exam-settings/StartExamButton";
import ExamSettingsSkeleton from "../components/exam-settings/ExamSettingsSkeleton";
import StartExamModal from "../components/exam-settings/StartExamModal";
import ExamModeSelector from "../components/exam-settings/ExamModeSelector";
import ResumeExamModal from "../components/exam-settings/ResumeExamModal";


const QUESTION_BANK_CACHE_KEY =
  "question-banks";


export default function ExamSettings() {
  const navigate = useNavigate();


  // =========================================================
  // Question Bank
  // =========================================================

  const [activeBank, setActiveBank] =
    useState<QuestionBank | null>(null);


  // =========================================================
  // Exam Settings
  // =========================================================

  const [questionCount, setQuestionCount] =
    useState(75);

  const [timed, setTimed] =
    useState(false);

  const [duration, setDuration] =
    useState(60);


  // =========================================================
  // Modals
  // =========================================================

  const [showModal, setShowModal] =
    useState(false);

  const [showResumeModal, setShowResumeModal] =
    useState(false);


  // =========================================================
  // Existing Exam
  // =========================================================

  const [existingExamId, setExistingExamId] =
    useState("");


  // =========================================================
  // Loading
  // =========================================================

  const [loading, setLoading] =
    useState(true);

  const [starting, setStarting] =
    useState(false);


  // =========================================================
  // Load Question Bank
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    async function loadQuestionBank() {

      // -------------------------------------------------------
      // Check cache first
      // -------------------------------------------------------

      const cachedBanks =
        getCached<{
          banks: QuestionBank[];
        }>(
          QUESTION_BANK_CACHE_KEY
        );

      if (cachedBanks) {

        const active =
          cachedBanks.banks.find(
            (bank: QuestionBank) =>
              bank.active
          ) ?? null;

        if (!cancelled) {
          setActiveBank(active);
          setLoading(false);
        }

        return;
      }


      // -------------------------------------------------------
      // No cache → fetch
      // -------------------------------------------------------

      try {
        const data =
          await getQuestionBanks();

        if (cancelled) {
          return;
        }


        // Save complete response
        // for other pages to reuse.
        setCached(
          QUESTION_BANK_CACHE_KEY,
          data
        );


        const active =
          data.banks.find(
            (bank: QuestionBank) =>
              bank.active
          ) ?? null;

        setActiveBank(active);

      } catch (error) {
        console.error(
          "Failed to load question banks:",
          error
        );

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadQuestionBank();

    return () => {
      cancelled = true;
    };
  }, []);


  // =========================================================
  // Start Exam
  // =========================================================

  async function handleStartExam() {
    if (!activeBank) {
      return;
    }

    setStarting(true);

    try {
      const response =
        await generateExam({
          questionCount,
          timed,
          durationMinutes:
            timed
              ? duration
              : null,
        });


      // -------------------------------------------------------
      // Existing unfinished exam
      // -------------------------------------------------------

      if (response.unfinishedExam) {
        setExistingExamId(
          response.examId
        );

        setShowResumeModal(true);

        return;
      }


      // -------------------------------------------------------
      // New exam
      // -------------------------------------------------------

      navigate(
        `/exam/${response.examId}`
      );

    } catch (error) {
      console.error(
        "Failed to start exam:",
        error
      );

    } finally {
      setStarting(false);
    }
  }


  // =========================================================
  // Loading
  // =========================================================

  if (loading) {
    return <ExamSettingsSkeleton />;
  }


  // =========================================================
  // No Question Bank
  // =========================================================

  if (!activeBank) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950">

        <p className="text-zinc-400">
          No Question Bank Found
        </p>

      </main>
    );
  }


  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="min-h-screen bg-zinc-950">

      <div
        className="
          mx-auto
          flex
          max-w-4xl
          flex-col
          gap-8
          px-8
          py-8
        "
      >

        {/* Header */}

        <ExamSettingsHeader />


        {/* Question Count */}

        <QuestionCountSelector
          totalQuestions={
            activeBank.questionCount
          }
          value={questionCount}
          onChange={setQuestionCount}
        />


        {/* Exam Mode */}

        <ExamModeSelector
          timed={timed}
          duration={duration}
          onTimedChange={setTimed}
          onDurationChange={setDuration}
        />


        {/* Summary */}

        <ExamSummary
          selectedQuestions={
            questionCount
          }
          totalQuestions={
            activeBank.questionCount
          }
          timed={timed}
          duration={duration}
        />


        {/* Start */}

        <StartExamButton
          loading={starting}
          onClick={() =>
            setShowModal(true)
          }
        />

      </div>


      {/* =====================================================
          Start Exam Modal
      ===================================================== */}

      <StartExamModal
        open={showModal}

        questionCount={
          questionCount
        }

        loading={starting}

        onCancel={() =>
          setShowModal(false)
        }

        onConfirm={async () => {
          setShowModal(false);

          await handleStartExam();
        }}
      />


      {/* =====================================================
          Resume Existing Exam Modal
      ===================================================== */}

      <ResumeExamModal
        open={showResumeModal}

        onResume={() => {
          setShowResumeModal(false);

          navigate(
            `/exam/${existingExamId}`
          );
        }}

        onStartNew={async () => {
          try {
            setShowResumeModal(false);

            setStarting(true);


            // Delete unfinished exam

            await deleteExam(
              existingExamId
            );


            // Create new exam

            const response =
              await generateExam({
                questionCount,
                timed,
                durationMinutes:
                  timed
                    ? duration
                    : null,
              });


            navigate(
              `/exam/${response.examId}`
            );

          } catch (err) {
            console.error(
              "Failed to start new exam:",
              err
            );

          } finally {
            setStarting(false);
          }
        }}

        onCancel={() =>
          setShowResumeModal(false)
        }
      />

    </main>
  );
}