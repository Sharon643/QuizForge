import { api } from "./api";

export interface QuestionBank {
    id: string;
    fileName: string;
    questionCount: number;
    uploadedAt: string;
    lastModified: string;
    active: boolean;
}

export async function getQuestionBanks() {
    const response = await api.get("/question-banks");
    return response.data;
}

export async function selectQuestionBank(
    id: string
) {
    await api.post(
        `/question-banks/${id}/select`
    );
}

export async function deleteQuestionBank(
    id: string
) {
    await api.delete(
        `/question-banks/${id}`
    );
}

export async function getCurrentQuestionBank() {
    const response = await api.get(
        "/question-bank"
    );

    return response.data;
}

export async function getQuestions() {
    const response = await api.get(
        "/question-bank/questions"
    );

    return response.data;
}

export async function getQuestionBankQuestions(
  id: string
) {
  const response = await api.get(
    `/question-banks/${id}/questions`
  );

  return response.data;
}

export async function generateAnswers(
    bankId: string
) {
    const response = await api.post(
        `/question-banks/${bankId}/generate-answers`
    );

    return response.data;
}

export async function updateAnswer(
  questionId: string,
  correctAnswer: string,
  explanation: string
) {
  const response = await api.patch(
    `/questions/${questionId}/answer`,
    {
      correct_answer: correctAnswer,
      explanation,
    }
  );

  return response.data.question;
}