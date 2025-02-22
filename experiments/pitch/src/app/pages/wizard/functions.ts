"use server";

import { db } from "@/db";
// @ts-ignore
import { QuestionType } from "@prisma/client";

interface SaveAnswerParams {
  submissionId: string;
  questionId: string;
  value: string;
  type: QuestionType;
}

export async function saveAnswer({
  submissionId,
  questionId,
  value,
  type,
}: SaveAnswerParams) {
  const data: any = {};

  switch (type) {
    case "TEXT":
    case "URL":
      data.answerText = value;
      break;
    case "BOOLEAN":
      data.answerBoolean = value === "true" ? 1 : 0;
      break;
    case "NUMBER":
      data.answerNumber = parseFloat(value);
      break;
    case "FILE":
      data.fileUrl = value;
      break;
    // Add other types as needed
  }

  return db.answer.create({
    data: {
      submissionId,
      questionId,
      ...data,
    },
  });
}

export async function completeSubmission(submissionId: string) {
  return db.submission.update({
    where: { id: submissionId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });
}
