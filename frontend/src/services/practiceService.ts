import {api} from "./api";

import type {
  PracticeSession,
  StartPracticeResponse,
  SubmitPracticeAnswerResponse,
  FinishPracticeResponse,
} from "../types/practice";

export async function startPractice(
  questionCount: number,
  questionBankId?: string,
): Promise<StartPracticeResponse> {
  const response = await api.post(
    "/practice/start",
    {
      questionCount,
      questionBankId,
    },
  );

  return response.data;
}

export async function getPractice(
  practiceId: string,
): Promise<PracticeSession> {
  const response = await api.get(
    `/practice/${practiceId}`,
  );

  return response.data;
}

export async function submitPracticeAnswer(
  practiceId: string,
  questionId: string,
  selectedOption: string,
): Promise<SubmitPracticeAnswerResponse> {
  const response = await api.post(
    `/practice/${practiceId}/answer`,
    {
      questionId,
      selectedOption,
    },
  );

  return response.data;
}

export async function finishPractice(
  practiceId: string,
): Promise<FinishPracticeResponse> {
  const response = await api.post(
    `/practice/${practiceId}/finish`,
  );

  return response.data;
}

export async function getCurrentPractice() {

    const response =
        await api.get("/practice/current");

    return response.data;

}