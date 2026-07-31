import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import UploadDropzone from "../components/upload/UploadDropzone";
import SelectedFileCard from "../components/upload/SelectedFileCard";
import UploadProgress from "../components/upload/UploadProgress";
import ExtractionSuccess from "../components/upload/ExtractionSuccess";

import {
  uploadPdf,
  getExtractionStatus,
  type ExtractionProgress,
} from "../services/extraction";

type UploadStatus =
  | "idle"
  | "uploading"
  | "extracting"
  | "success"
  | "error";

export default function UploadPdf() {
  const navigate = useNavigate();

  const intervalRef = useRef<number | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [status, setStatus] =
    useState<UploadStatus>("idle");

  const [progress, setProgress] =
    useState<ExtractionProgress | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  async function handleUpload() {
    if (!selectedFile) return;

    try {
      setError(null);
      setProgress(null);

      setStatus("uploading");

      const response = await uploadPdf(selectedFile);

      setStatus("extracting");

      startPolling(response.jobId);
    } catch (err: any) {
      console.error(err);

      setStatus("error");

      const message =
        err.response?.data?.detail ??
        err.response?.data?.message ??
        "Failed to upload PDF. Please try again.";

      setError(message);
    }
  }

  function startPolling(jobId: string) {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(
      async () => {
        try {
          const data =
            await getExtractionStatus(jobId);

          setProgress(data);

          if (data.completed) {
            if (intervalRef.current) {
              window.clearInterval(
                intervalRef.current
              );
            }

            setStatus("success");
          }
        } catch (err) {
          console.error(err);

          if (intervalRef.current) {
            window.clearInterval(
              intervalRef.current
            );
          }

          setStatus("error");

          setError(
            "Unable to retrieve extraction progress."
          );
        }
      },
      2000
    );
  }

  function handleRemove() {
    setSelectedFile(null);
    setStatus("idle");
    setProgress(null);
    setError(null);

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
  }

  function renderContent() {
    switch (status) {
      case "success":
          if (!progress) {
              return null;
          }

          return (
              <ExtractionSuccess
                  fileName={progress.fileName ?? ""}
                  bankId={progress.bankId ?? ""}
                  questionCount={progress.questionCount ?? 0}
                  subjects={progress.subjects ?? 0}
                  officialAnswers={progress.officialAnswers ?? 0}
                  missingAnswers={progress.missingAnswers ?? 0}
              />
          );

      case "error":
        return (
          <>
            {selectedFile && (
              <SelectedFileCard
                file={selectedFile}
                uploading={false}
                onRemove={handleRemove}
                onUpload={handleUpload}
              />
            )}

            <div className="mt-6 rounded-xl border border-red-900 bg-red-950/30 p-4 text-red-300">
              {error}
            </div>
          </>
        );

      case "uploading":
        return (
          <UploadProgress
            progress={{
              jobId: "",
              stage: "uploading",
              percent: 0,
              message: "Uploading PDF...",
              completed: false,
            }}
          />
        );

      case "extracting":
        return progress ? (
          <UploadProgress
            progress={progress}
          />
        ) : (
          <UploadProgress
            progress={{
              jobId: "",
              stage: "starting",
              percent: 0,
              message:
                "Preparing extraction...",
              completed: false,
            }}
          />
        );

      default:
        return (
          <>
            <UploadDropzone
              onFileSelected={setSelectedFile}
            />

            {selectedFile && (
              <div className="mt-8">
                <SelectedFileCard
                  file={selectedFile}
                  uploading={false}
                  onRemove={handleRemove}
                  onUpload={handleUpload}
                />
              </div>
            )}
          </>
        );
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-4xl px-8 py-10">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-8 flex items-center gap-2 text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <h1 className="text-4xl font-bold text-white">
          Import Question Bank
        </h1>

        <p className="mt-3 max-w-2xl text-zinc-400">
          Upload a PDF and we'll automatically
          extract questions, build a question
          bank, and prepare it for exams.
        </p>

        <div className="mt-10">
          {renderContent()}
        </div>
      </div>
    </main>
  );
}