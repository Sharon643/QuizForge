import { useEffect, useState } from "react";

import {
  Upload,
  ClipboardList,
  Brain,
  RotateCcw,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import ContinueCard from "../components/dashboard/ContinueCard";
import QuestionBankCard from "../components/dashboard/QuestionBankCard";
import QuickActionCard from "../components/dashboard/QuickActionCard";
import StatCard from "../components/dashboard/StatCard";
import UserMenu from "../components/UserMenu";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";
import ContinuePracticeDialog from "../components/dashboard/ContinuePracticeDialog";

import type { QuestionBank } from "../types/questionBank";

import { getQuestionBanks } from "../services/questionBank";
import { getCurrentExam } from "../services/examService";
import { getHistory } from "../services/historyService";
import { getCurrentPractice } from "../services/practiceService";

import { useAuth } from "../context/AuthContext";


/* =========================================================
   Dashboard Cache
========================================================= */

type DashboardCache = {
  questionBanks: QuestionBank[];
  activeBank: QuestionBank | null;
  currentExam: any;
  currentPractice: any;
  examsTaken: number;
  timestamp: number;
};

let dashboardCache: DashboardCache | null = null;


/* =========================================================
   Cache duration
   30 seconds
========================================================= */

const CACHE_DURATION = 30 * 1000;


export default function Dashboard() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const [questionBanks, setQuestionBanks] =
    useState<QuestionBank[]>(
      dashboardCache?.questionBanks ?? []
    );

  const [activeBank, setActiveBank] =
    useState<QuestionBank | null>(
      dashboardCache?.activeBank ?? null
    );

  const [currentExam, setCurrentExam] =
    useState<any>(
      dashboardCache?.currentExam ?? null
    );

  const [currentPractice, setCurrentPractice] =
    useState<any>(
      dashboardCache?.currentPractice ?? null
    );

  const [showPracticeDialog, setShowPracticeDialog] =
    useState(false);

  const [loading, setLoading] =
    useState(!dashboardCache);

  const [examsTaken, setExamsTaken] =
    useState(
      dashboardCache?.examsTaken ?? 0
    );


  /* =========================================================
     Load Dashboard
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        /*
         * If cached data exists and is still fresh,
         * show it immediately and don't make another request.
         */

        if (
          dashboardCache &&
          Date.now() - dashboardCache.timestamp <
            CACHE_DURATION
        ) {
          setLoading(false);
          return;
        }

        /*
         * If cache exists but is stale,
         * keep showing the existing dashboard while
         * fresh data loads.
         */

        if (dashboardCache) {
          setLoading(false);
        }

        const [
          banksResponse,
          examResponse,
          practiceResponse,
          historyResponse,
        ] = await Promise.all([
          getQuestionBanks(),
          getCurrentExam(),
          getCurrentPractice(),
          getHistory(),
        ]);

        if (cancelled) {
          return;
        }


        /* =====================================================
           Question Banks
        ===================================================== */

        const banks =
          banksResponse.banks;

        const active =
          banks.find(
            (bank: QuestionBank) =>
              bank.active
          ) ?? null;


        /* =====================================================
           Current Exam
        ===================================================== */

        const exam =
          examResponse.exists
            ? examResponse.exam
            : null;


        /* =====================================================
           Current Practice
        ===================================================== */

        const practice =
          practiceResponse.exists
            ? practiceResponse.practice
            : null;


        /* =====================================================
           History
        ===================================================== */

        const examCount =
          historyResponse.exams.length;


        /* =====================================================
           Update React state
        ===================================================== */

        setQuestionBanks(banks);
        setActiveBank(active);
        setCurrentExam(exam);
        setCurrentPractice(practice);
        setExamsTaken(examCount);


        /* =====================================================
           Update cache
        ===================================================== */

        dashboardCache = {
          questionBanks: banks,
          activeBank: active,
          currentExam: exam,
          currentPractice: practice,
          examsTaken: examCount,
          timestamp: Date.now(),
        };

      } catch (error) {
        console.error(
          "Failed to load dashboard:",
          error
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);


  /* =========================================================
     Loading
  ========================================================= */

  if (loading) {
    return <DashboardSkeleton />;
  }


  /* =========================================================
     Current Exam Progress
  ========================================================= */

  const answered =
    currentExam
      ? Object.values(
          currentExam.answers ?? {}
        ).filter(
          (answer: any) =>
            answer.selectedOption !== null &&
            answer.selectedOption !== undefined
        ).length
      : 0;


  const progress =
    currentExam &&
    currentExam.questionCount > 0
      ? Math.round(
          (answered /
            currentExam.questionCount) *
            100
        )
      : 0;


  /* =========================================================
     User
  ========================================================= */

  const userName =
    user?.user_metadata?.name ||
    "there";


  /* =========================================================
     Render
  ========================================================= */

  return (
    <main className="min-h-screen bg-zinc-950">

      <div
        className="
          mx-auto
          flex
          max-w-7xl
          flex-col
          gap-10
          px-8
          py-8
        "
      >

        {/* Header */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-4
          "
        >
          <DashboardHeader />

          <UserMenu />
        </div>


        {/* Welcome */}

        <section>

          <h2
            className="
              text-4xl
              font-semibold
              text-white
            "
          >
            Welcome back, {userName}.
          </h2>

          <p
            className="
              mt-2
              text-zinc-400
            "
          >
            Continue your preparation and build momentum.
          </p>

        </section>


        {/* Statistics */}

        <section>

          <div
            className="
              grid
              gap-6
              md:grid-cols-3
            "
          >

            <StatCard
              title="Questions"
              value={
                activeBank?.questionCount ?? 0
              }
            />

            <StatCard
              title="Exams Taken"
              value={examsTaken}
            />

            <StatCard
              title="Question Banks"
              value={questionBanks.length}
            />

          </div>

        </section>


        {/* Continue + Question Bank */}

        <section>

          <div
            className="
              grid
              gap-6
              lg:grid-cols-2
            "
          >

            <ContinueCard
              title={
                currentExam
                  ? "Continue Exam"
                  : "No Active Exam"
              }
              questionCount={
                currentExam?.questionCount ?? 0
              }
              progress={progress}
              lastStudied={
                currentExam
                  ? new Date(
                      currentExam.startedAt
                    ).toLocaleDateString()
                  : "N/A"
              }
              onResume={() =>
                currentExam
                  ? navigate(
                      `/exam/${currentExam.examId}`
                    )
                  : navigate(
                      "/exam-settings"
                    )
              }
            />


            <QuestionBankCard
              fileName={
                activeBank?.fileName ??
                "No Question Bank"
              }
              questionCount={
                activeBank?.questionCount ?? 0
              }
              uploadedAt={
                activeBank?.uploadedAt
                  ? new Date(
                      activeBank.uploadedAt
                    ).toLocaleDateString(
                      "en-GB"
                    )
                  : "N/A"
              }
              onManage={() =>
                navigate(
                  "/question-bank"
                )
              }
              onUpload={() =>
                navigate("/upload")
              }
            />

          </div>

        </section>


        {/* Get Started */}

        <section>

          <div className="mb-6">

            <h2
              className="
                text-xl
                font-semibold
                text-white
              "
            >
              Get Started
            </h2>

            <p
              className="
                mt-2
                text-zinc-400
              "
            >
              Choose how you'd like to continue learning.
            </p>

          </div>


          <div
            className="
              grid
              gap-6
              md:grid-cols-2
              xl:grid-cols-4
            "
          >

            <QuickActionCard
              title="Upload PDF"
              description="Import questions into your question bank."
              icon={
                <Upload
                  size={22}
                  className="text-zinc-400"
                />
              }
              onClick={() =>
                navigate("/upload")
              }
            />


            <QuickActionCard
              title="Start Exam"
              description="Simulate a real timed examination."
              icon={
                <ClipboardList
                  size={22}
                  className="text-zinc-400"
                />
              }
              onClick={() =>
                navigate(
                  "/exam-settings"
                )
              }
            />


            <QuickActionCard
              title={
                currentPractice
                  ? "Continue Practice"
                  : "Practice"
              }
              description={
                currentPractice
                  ? `Resume ${
                      Object.keys(
                        currentPractice.answers ?? {}
                      ).length
                    } / ${
                      currentPractice.questionCount
                    } questions`
                  : "Practice with instant feedback."
              }
              icon={
                <Brain
                  size={22}
                  className="text-zinc-400"
                />
              }
              onClick={() => {

                if (currentPractice) {
                  setShowPracticeDialog(true);
                } else {
                  navigate(
                    "/practice/settings"
                  );
                }

              }}
            />


            <QuickActionCard
              title="Exam History"
              description="Review previous exams."
              icon={
                <RotateCcw
                  size={22}
                  className="text-zinc-400"
                />
              }
              onClick={() =>
                navigate("/history")
              }
            />

          </div>

        </section>

      </div>


      {/* Continue Practice Dialog */}

      <ContinuePracticeDialog
        open={showPracticeDialog}
        practice={currentPractice}
        onClose={() =>
          setShowPracticeDialog(false)
        }
        onContinue={() =>
          navigate(
            `/practice/${currentPractice.practiceId}`
          )
        }
        onStartNew={() =>
          navigate(
            "/practice/settings"
          )
        }
      />

    </main>
  );
}