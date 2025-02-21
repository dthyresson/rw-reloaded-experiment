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
