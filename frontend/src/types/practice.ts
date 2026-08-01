export interface PracticeQuestion {
  id: string;
  number: number;
  subject?: string;

  question: string;

  options: Record<string, string>;

  correct_answer: string;

  explanation?: string;
}

export interface PracticeAnswer {
    selectedOption: string | null;

    isCorrect: boolean | null;

    correctAnswer: string | null;

    explanation: string;
}

export interface PracticeSession {
  practiceId: string;

  questionBank: string;

  questionCount: number;

  questions: PracticeQuestion[];

  answers: Record<string, PracticeAnswer>;
}

export interface StartPracticeResponse {
  success: boolean;

  practiceId: string;

  questionCount: number;

  questionBank: string;
}

export interface SubmitPracticeAnswerResponse {
  correct: boolean;

  correctAnswer: string;

  explanation?: string;
}

export interface FinishPracticeResponse {
  correct: number;

  wrong: number;

  skipped: number;

  accuracy: number;
}