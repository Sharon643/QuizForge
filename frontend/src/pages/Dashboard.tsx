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

import { useAuth } from "../context/AuthContext";
import {getCurrentPractice,} from "../services/practiceService";


export default function Dashboard() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const [questionBanks, setQuestionBanks] =
    useState<QuestionBank[]>([]);

  const [activeBank, setActiveBank] =
    useState<QuestionBank | null>(null);

  const [currentExam, setCurrentExam] =
    useState<any>(null);

  const [currentPractice,setCurrentPractice,] = 
    useState<any>(null);

  const [showPracticeDialog,setShowPracticeDialog,] = 
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [examsTaken, setExamsTaken] =
    useState(0);

  // --------------------------------------------------
  // Load Dashboard Data
  // --------------------------------------------------

  useEffect(() => {
    async function loadDashboard() {
      try {

        // Question Banks

        const data =
          await getQuestionBanks();

        setQuestionBanks(
          data.banks
        );

        const active =
          data.banks.find(
            (bank: QuestionBank) =>
              bank.active
          ) ?? null;

        setActiveBank(
          active
        );


        // Current Exam

        const examResponse =
          await getCurrentExam();

        if (
          examResponse.exists
        ) {
          setCurrentExam(
            examResponse.exam
          );
        } else {
          setCurrentExam(
            null
          );
        }

        const practiceResponse =
            await getCurrentPractice();

        if (
            practiceResponse.exists
        ) {

            setCurrentPractice(
                practiceResponse.practice
            );

        }
        else {

            setCurrentPractice(
                null
            );

        }


        // Exam History

        const historyResponse =
          await getHistory();

        setExamsTaken(
          historyResponse.exams.length
        );

      } catch (error) {

        console.error(
          "Failed to load dashboard:",
          error
        );

      } finally {

        setLoading(false);

      }
    }

    loadDashboard();

  }, []);


  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <DashboardSkeleton />
    );
  }


  // --------------------------------------------------
  // Current Exam Progress
  // --------------------------------------------------

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
          (
            answered /
            currentExam.questionCount
          ) * 100
        )

      : 0;


  // --------------------------------------------------
  // User
  // --------------------------------------------------

  const userName =
    user?.user_metadata?.name ||
    "there";


  // --------------------------------------------------
  // Render
  // --------------------------------------------------

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

        {/* ==================================================
            Header
        ================================================== */}

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


        {/* ==================================================
            Welcome
        ================================================== */}

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


        {/* ==================================================
            Statistics
        ================================================== */}

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
                activeBank?.questionCount ??
                0
              }
            />

            <StatCard
              title="Exams Taken"
              value={
                examsTaken
              }
            />

            <StatCard
              title="Question Banks"
              value={
                questionBanks.length
              }
            />

          </div>

        </section>


        {/* ==================================================
            Continue + Question Bank
        ================================================== */}

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
                currentExam?.questionCount ??
                0
              }

              progress={
                progress
              }

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
                activeBank?.questionCount ??
                0
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
                navigate(
                  "/upload"
                )
              }

            />

          </div>

        </section>


        {/* ==================================================
            Get Started
        ================================================== */}

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

              description="
                Import questions into your question bank.
              "

              icon={
                <Upload
                  size={22}
                  className="text-zinc-400"
                />
              }

              onClick={() =>
                navigate(
                  "/upload"
                )
              }

            />


            <QuickActionCard

              title="Start Exam"

              description="
                Simulate a real timed examination.
              "

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

                      ? `Resume ${Object.keys(
                          currentPractice.answers ?? {}
                        ).length} / ${currentPractice.questionCount} questions`

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

                      navigate("/practice/settings");

                  }

              }}

            />


            <QuickActionCard

              title="Exam History"

              description="
                Review previous exams.
              "

              icon={
                <RotateCcw
                  size={22}
                  className="text-zinc-400"
                />
              }

              onClick={() =>
                navigate(
                  "/history"
                )
              }

            />

          </div>

        </section>

      </div>
      <ContinuePracticeDialog

          open={showPracticeDialog}

          practice={currentPractice}

          onClose={() =>
              setShowPracticeDialog(false)
          }

          onContinue={() => {

              navigate(
                  `/practice/${currentPractice.practiceId}`
              );

          }}

          onStartNew={() => {

              navigate(
                  "/practice/settings"
              );

          }}

      />

    </main>
  );
}