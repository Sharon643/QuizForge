import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import HistoryCard from "../components/history/HistoryCard";
import HistoryFilter from "../components/history/HistoryFilter";
import HistoryHeader from "../components/history/HistoryHeader";
import HistorySkeleton from "../components/history/HistorySkeleton";

import { getHistory } from "../services/historyService";

import type { HistoryItem } from "../types/history";

import {
  getCached,
  setCached,
} from "../utils/apiCache";


const HISTORY_CACHE_KEY = "history";


export default function History() {
  const navigate = useNavigate();


  // =========================================================
  // History
  // =========================================================

  const [history, setHistory] =
    useState<HistoryItem[]>([]);

  const [loading, setLoading] =
    useState(true);


  // =========================================================
  // Filters
  // =========================================================

  const [search, setSearch] =
    useState("");

  const [selectedMode, setSelectedMode] =
    useState<
      "All" | "Timed" | "Practice"
    >("All");


  // =========================================================
  // Load History
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {

        // -----------------------------------------------------
        // Check cache first
        // -----------------------------------------------------

        const cached =
          getCached<{
            exams: HistoryItem[];
          }>(
            HISTORY_CACHE_KEY
          );

        if (cached) {

          if (!cancelled) {
            setHistory(
              cached.exams
            );

            setLoading(false);
          }

          return;
        }


        // -----------------------------------------------------
        // No cache → fetch
        // -----------------------------------------------------

        setLoading(true);

        const response =
          await getHistory();


        if (cancelled) {
          return;
        }


        setHistory(
          response.exams
        );


        // Save for future visits
        setCached(
          HISTORY_CACHE_KEY,
          response
        );

      } catch (error) {
        console.error(
          "Failed to load history:",
          error
        );

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHistory();


    return () => {
      cancelled = true;
    };
  }, []);


  // =========================================================
  // Filtered History
  // =========================================================

  const filteredHistory =
    useMemo(() => {
      return history.filter(
        (exam) => {

          const matchesSearch =
            exam.questionBank
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesMode =
            selectedMode === "All" ||
            exam.mode.toLowerCase() ===
              selectedMode.toLowerCase();

          return (
            matchesSearch &&
            matchesMode
          );
        }
      );
    }, [
      history,
      search,
      selectedMode,
    ]);


  // =========================================================
  // Average Score
  // =========================================================

  const averageScore =
    useMemo(() => {
      if (!history.length) {
        return 0;
      }

      const total =
        history.reduce(
          (sum, exam) =>
            sum + exam.percentage,
          0
        );

      return Number(
        (
          total /
          history.length
        ).toFixed(1)
      );

    }, [history]);


  // =========================================================
  // Best Score
  // =========================================================

  const bestScore =
    useMemo(() => {
      if (!history.length) {
        return 0;
      }

      return Math.max(
        ...history.map(
          (exam) =>
            exam.percentage
        )
      );

    }, [history]);


  // =========================================================
  // Loading
  // =========================================================

  if (loading) {
    return <HistorySkeleton />;
  }


  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      className="
        mx-auto
        max-w-7xl
        space-y-8
        px-6
        py-10
      "
    >

      <HistoryHeader
        totalExams={
          history.length
        }
        averageScore={
          averageScore
        }
        bestScore={
          bestScore
        }
      />


      <HistoryFilter
        search={search}
        selectedMode={
          selectedMode
        }
        onSearchChange={
          setSearch
        }
        onModeChange={
          setSelectedMode
        }
      />


      {filteredHistory.length === 0 ? (

        <div
          className="
            rounded-2xl
            border
            border-dashed
            border-zinc-700
            bg-zinc-900
            py-20
            text-center
          "
        >

          <h2
            className="
              text-2xl
              font-semibold
              text-white
            "
          >
            No Exams Found
          </h2>

          <p
            className="
              mt-3
              text-zinc-400
            "
          >
            Complete an exam to see
            your history here.
          </p>

        </div>

      ) : (

        <div className="grid gap-6">

          {filteredHistory.map(
            (exam) => (

              <HistoryCard
                key={exam.examId}
                exam={exam}
                onReview={(examId) =>
                  navigate(
                    `/review/${examId}`
                  )
                }
              />

            )
          )}

        </div>

      )}

    </div>
  );
}