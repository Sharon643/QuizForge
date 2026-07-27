import { useState } from "react";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../ui/Button";
import { generateAnswers } from "../../services/questionBank";

interface Props {
    fileName: string;
    bankId: string;

    questionCount: number;
    subjects: number;

    officialAnswers: number;
    missingAnswers: number;
}

type GenerationState =
    | "idle"
    | "generating"
    | "completed";

interface GenerationResult {
    processed: number;
    updated: number;
    remaining: number;
    average_confidence: number;
}

export default function ExtractionSuccess({
    fileName,
    bankId,
    questionCount,
    subjects,
    officialAnswers,
    missingAnswers,
}: Props) {

    const navigate = useNavigate();

    const [state, setState] =
        useState<GenerationState>("idle");

    const [error, setError] =
        useState("");

    const [result, setResult] =
        useState<GenerationResult | null>(null);

    async function handleGenerate() {

        try {

            setError("");

            setState("generating");

            const response =
                await generateAnswers(bankId);

            setResult(response);

            setState("completed");

        } catch (err) {

            console.error(err);

            setState("idle");

            setError(
                "Failed to generate AI answers."
            );

        }

    }

    return (

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">

            <div className="text-center">

                <CheckCircle2
                    size={60}
                    className="mx-auto text-emerald-400"
                />

                <h2 className="mt-6 text-3xl font-bold text-white">

                    Extraction Complete

                </h2>

                <p className="mt-3 text-zinc-400">

                    {fileName}

                </p>

            </div>

            <div className="mt-10 rounded-xl border border-zinc-800 bg-zinc-950 p-6">

                <div className="grid grid-cols-2 gap-6">

                    <Stat
                        label="Questions"
                        value={questionCount}
                    />

                    <Stat
                        label="Subjects"
                        value={subjects}
                    />

                    <Stat
                        label="Official Answers"
                        value={officialAnswers}
                    />

                    <Stat
                        label="Missing Answers"
                        value={missingAnswers}
                    />

                </div>

            </div>

        {state === "idle" && (

            missingAnswers > 0 ? (

                <>

                    <div className="mt-8 rounded-xl border border-amber-700 bg-amber-950/20 p-5">

                        <div className="flex items-start gap-3">

                            <Sparkles
                                className="mt-1 text-amber-400"
                                size={22}
                            />

                            <div>

                                <h3 className="font-semibold text-amber-300">
                                    AI Answer Generation
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-zinc-300">

                                    AI can generate answers for{" "}
                                    <strong>{missingAnswers}</strong>{" "}
                                    unanswered questions.

                                    <br /><br />

                                    These answers are AI-generated and
                                    should be verified before studying.

                                </p>

                            </div>

                        </div>

                    </div>

                    {error && (

                        <div className="mt-5 rounded-lg border border-red-800 bg-red-950/30 p-4 text-red-300">
                            {error}
                        </div>

                    )}

                    <div className="mt-8 flex justify-center gap-4">

                        <Button
                            variant="secondary"
                            onClick={() =>
                                navigate("/question-bank")
                            }
                        >
                            Skip
                        </Button>

                        <Button
                            onClick={handleGenerate}
                        >
                            Generate AI Answers
                        </Button>

                    </div>

                </>

            ) : (

                <>

                    <div className="mt-8 rounded-xl border border-emerald-700 bg-emerald-950/20 p-5 text-center">

                        <CheckCircle2
                            className="mx-auto mb-3 text-emerald-400"
                            size={32}
                        />

                        <h3 className="text-lg font-semibold text-emerald-300">
                            All Answers Available
                        </h3>

                        <p className="mt-2 text-sm text-zinc-300">
                            Every question already has an official answer.
                            Your question bank is ready to use.
                        </p>

                    </div>

                    <div className="mt-8 flex justify-center">

                        <Button
                            onClick={() =>
                                navigate("/question-bank")
                            }
                        >
                            Proceed to Question Bank
                        </Button>

                    </div>

                </>

            )

        )}

        {state === "generating" && (

            <div className="mt-10 text-center">

                <Loader2
                    size={48}
                    className="mx-auto animate-spin text-blue-400"
                />

                <h3 className="mt-6 text-2xl font-semibold text-white">

                    Generating AI Answers...

                </h3>

                <p className="mt-4 max-w-lg mx-auto leading-7 text-zinc-400">

                    The AI is analyzing every unanswered
                    question individually.

                    <br /><br />

                    Questions containing diagrams,
                    tables or incomplete information
                    may remain unanswered to maintain
                    accuracy.

                </p>

            </div>

        )}

            {state === "completed" && result && (

                <div className="mt-10">

                    <div className="text-center">

                        <CheckCircle2
                            size={54}
                            className="mx-auto text-emerald-400"
                        />

                        <h3 className="mt-6 text-2xl font-bold text-white">
                            AI Answer Generation Complete
                        </h3>

                        <p className="mt-2 text-zinc-400">
                            Your question bank has been updated with
                            AI-generated answers where possible.
                        </p>

                    </div>

                    <div className="mx-auto mt-8 max-w-lg rounded-xl border border-zinc-800 bg-zinc-950 p-6">

                        <div className="space-y-4">

                            <ResultRow
                                label="Questions Analyzed"
                                value={result.processed}
                            />

                            <ResultRow
                                label="AI Answers Generated"
                                value={result.updated}
                            />

                            <ResultRow
                                label="Could Not Be Answered"
                                value={result.remaining}
                            />

                            <ResultRow
                                label="Average Confidence"
                                value={`${(
                                    result.average_confidence * 100
                                ).toFixed(1)}%`}
                            />

                        </div>

                    </div>

                    {result.remaining > 0 && (

                        <div className="mx-auto mt-8 max-w-lg rounded-xl border border-amber-700 bg-amber-950/20 p-6">

                            <h4 className="font-semibold text-amber-300">

                                Why are some questions still unanswered?

                            </h4>

                            <p className="mt-3 text-sm leading-6 text-zinc-300">

                                Some questions rely on diagrams,
                                figures, tables or incomplete text
                                extracted from the PDF.

                                <br /><br />

                                Rather than guessing, the AI leaves
                                those questions unanswered so you can
                                review them manually.

                            </p>

                        </div>

                    )}

                    <div className="mt-8 flex justify-center gap-4">

                        {result.remaining > 0 && (

                            <Button
                                variant="secondary"
                                onClick={() =>
                                    navigate("/question-bank?filter=missing")
                                }
                            >
                                Review Unanswered
                            </Button>

                        )}

                        <Button
                            onClick={() =>
                                navigate("/question-bank")
                            }
                        >
                            Open Question Bank
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={() =>
                                navigate("/dashboard")
                            }
                        >
                            Dashboard
                        </Button>

                    </div>

                </div>

            )}

        </section>

    );

}

interface StatProps {
    label: string;
    value: number;
}

function Stat({
    label,
    value,
}: StatProps) {

    return (

        <div>

            <p className="text-sm text-zinc-500">

                {label}

            </p>

            <p className="mt-2 text-2xl font-bold text-white">

                {value}

            </p>

        </div>

    );

}

interface ResultRowProps {
    label: string;
    value: string | number;
}

function ResultRow({
    label,
    value,
}: ResultRowProps) {

    return (

        <div className="flex items-center justify-between">

            <span className="text-zinc-400">

                {label}

            </span>

            <span className="font-semibold text-white">

                {value}

            </span>

        </div>

    );

}