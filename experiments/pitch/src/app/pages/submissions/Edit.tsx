"use server";

import { RouteContext } from "@redwoodjs/sdk/router";
import { getAnswer, getSubmission } from "@/app/services/submissions";
import AnswerForm from "./AnswerForm";

export async function Edit({ params, ctx }: RouteContext<{ id: string }>) {
  const submission = await getSubmission(params.id);
  const answer = await getAnswer(submission.answers[0].id);

  return (
    <>
      <AnswerForm
        answerId={answer.id}
        questionText={answer.question.questionText}
        answerText={answer.answerText}
      />
    </>
  );
}
