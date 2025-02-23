import React from "react";
import { RouteContext } from "@redwoodjs/sdk/router";
import { getSubmission } from "@/app/services/submissions";
import { SubmissionCard } from "@/app/pages/submissions/SubmissionCard";
import { link } from "@/app/shared/links";
import { EmailSummary } from "./EmailSummary";
import { getSummaryStream } from "@/app/services/summaryService";

export async function Detail({ params, ctx }: RouteContext<{ id: string }>) {
  const submission = await getSubmission(params.id);
  console.log(submission);
  const request = submission.answers
    .map((answer: any) => {
      const getAnswerValue = () => {
        switch (answer.question.questionType) {
          case "FILE":
            return answer.fileUrl || "";
          case "NUMBER":
            return answer.answerNumber?.toString() || "";
          case "CURRENCY":
            return `${answer.currencyType} ${answer.answerCurrency?.toString() || ""}`;
          case "BOOLEAN":
            return answer.answerBoolean ? "Yes" : "No";
          case "DATE":
            return answer.answerDate?.toISOString().split("T")[0] || "";
          case "DATETIME":
            return answer.answerDatetime?.toISOString() || "";
          case "PHONE":
            return answer.phone || "";
          case "URL":
            return answer.url || "";
          default:
            return answer.answerText || "";
        }
      };

      return `Question: ${answer.question.questionPosition + 1}. ${answer.question.questionText}\nAnswer: ${getAnswerValue()}`;
    })
    .join("\n");

  const summaryStream = await getSummaryStream(submission.id, request);

  return (
    <div className="max-w-auto mx-auto p-6 space-y-6">
      <nav className="flex gap-2 mb-6 items-center">
        <a href={link("/")} className="hover:underline">
          Home
        </a>
        <div className="h-4 w-px bg-gray-300"></div>
        <a href={link("/submissions")} className="hover:underline">
          Requests to Pitch
        </a>
        <div className="h-4 w-px bg-gray-300"></div>
        <span>{submission.user.name}'s Request</span>
      </nav>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SubmissionCard submission={submission} />
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Request Details</h2>
          <EmailSummary stream={summaryStream} />
        </div>
      </div>
    </div>
  );
}
