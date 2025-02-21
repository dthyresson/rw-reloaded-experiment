"use server";

import { db } from "@/db";

export async function getSubmission(id: string) {
  return await db.submission.findUnique({
    where: { id },
    include: {
      user: true,
      answers: {
        include: {
          question: true,
        },
      },
    },
  });
}

export async function allSubmissions() {
  return await db.submission.findMany({
    include: {
      user: true,
      answers: {
        include: {
          question: true,
        },
      },
    },
  });
}

export async function getAnswer(id: string) {
  return await db.answer.findUnique({
    where: { id },
    include: {
      question: true,
      submission: true,
    },
  });
}

export async function updateAnswer(id: string, answerText: string) {
  return await db.answer.update({
    where: { id },
    data: { answerText },
  });
}
