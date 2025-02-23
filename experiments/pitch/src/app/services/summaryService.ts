import { Langbase } from "langbase";
import { db } from "@/db";

const LANGBASE_API_KEY = process.env.LANGBASE_API_KEY;

const langbase = new Langbase({
  apiKey: LANGBASE_API_KEY!,
});

export async function getSummaryStream(submissionId: string, content: string) {
  const submission = await db.submission.findUnique({
    include: {
      questionSet: {
        include: {
          questions: { orderBy: { questionPosition: "asc" } },
        },
      },
    },
    where: {
      id: submissionId,
    },
  });

  const questions = submission?.questionSet?.questions
    .map(
      (q: any) =>
        `${q.questionPosition + 1}. ${q.questionText}. \n * Hint: ${q.hint}`,
    )
    .join("\n");

  return await langbase.pipe.run({
    messages: [{ role: "user", content: "" }],
    variables: [
      {
        name: "REQUEST",
        value: content,
      },
      {
        name: "QUESTIONS",
        value: questions,
      },
    ],
    stream: true,
    name: "ai-agent-pitch-email-summarizer",
  });
}
