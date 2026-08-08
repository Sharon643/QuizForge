import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

// Public pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Route protection
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy-loaded pages
const Dashboard = lazy(
  () => import("./pages/Dashboard")
);

const Exam = lazy(
  () => import("./pages/Exam")
);

const ExamSettings = lazy(
  () => import("./pages/ExamSettings")
);

const QuestionBank = lazy(
  () => import("./pages/QuestionBank")
);

const Results = lazy(
  () => import("./pages/Results")
);

const UploadPdf = lazy(
  () => import("./pages/UploadPdf")
);

const History = lazy(
  () => import("./pages/History")
);

const Review = lazy(
  () => import("./pages/Review")
);

const Practice = lazy(
  () => import("./pages/Practice")
);

const PracticeSettings = lazy(
  () => import("./pages/PracticeSettings")
);

const PracticeResult = lazy(
  () => import("./pages/PracticeResults")
);


function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />
    </div>
  );
}


function App() {
  return (
    <>
      <Toaster
        richColors
        position="top-right"
      />

      <Suspense fallback={<PageLoading />}>
        <Routes>

          {/* =========================
              Public Routes
          ========================= */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />


          {/* =========================
              Protected Routes
          ========================= */}

          <Route element={<ProtectedRoute />}>

            {/* Dashboard */}

            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />


            {/* Exam */}

            <Route
              path="/exam-settings"
              element={<ExamSettings />}
            />

            <Route
              path="/exam/:examId"
              element={<Exam />}
            />


            {/* Question Bank */}

            <Route
              path="/question-bank"
              element={<QuestionBank />}
            />


            {/* Results */}

            <Route
              path="/results"
              element={<Results />}
            />


            {/* Upload */}

            <Route
              path="/upload"
              element={<UploadPdf />}
            />


            {/* History */}

            <Route
              path="/history"
              element={<History />}
            />


            {/* Review */}

            <Route
              path="/review/:examId"
              element={<Review />}
            />


            {/* Practice */}

            <Route
              path="/practice"
              element={<Practice />}
            />

            <Route
              path="/practice/settings"
              element={<PracticeSettings />}
            />

            <Route
              path="/practice/:practiceId"
              element={<Practice />}
            />

            <Route
              path="/practice/result"
              element={<PracticeResult />}
            />

          </Route>

        </Routes>
      </Suspense>
    </>
  );
}

export default App;