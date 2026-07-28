export interface QuestionBank {
  id: string;
  fileName: string;
  questionCount: number;

  uploadedAt: string;
  lastModified: string;

  active: boolean;

  // Temporary compatibility fields
  subjects: number;
  hasQuestions?: boolean;
}

export interface QuestionSummary {
  id: string;

  number: number;

  page: number | null;

  subject: string | null;

  question: string;

  options: {
    A: string | null;
    B: string | null;
    C: string | null;
    D: string | null;
  };

  correct_answer: string | null;

  answer_source: "official" | "ai" | "manual" | "none" | null;

  confidence: number | null;

  explanation: string | null;
}

export interface QuestionBankListResponse {
  count: number;
  banks: QuestionBank[];
}

export interface QuestionListResponse {
  count: number;
  questions: QuestionSummary[];
}