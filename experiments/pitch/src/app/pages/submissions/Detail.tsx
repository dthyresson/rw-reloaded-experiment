import { RouteContext } from "@redwoodjs/sdk/router";
import { getSubmission } from "@/app/services/submissions";
import { SubmissionCard } from "@/app/pages/submissions/SubmissionCard";
import { link } from "@/app/shared/links";
import { db } from "@/db";

export async function Detail({ params, ctx }: RouteContext<{ id: string }>) {
  const submission = await getSubmission(params.id);
  const answers = await db.answer.findMany({
    include: {
      question: true,
    },
    where: {
      submissionId: params.id,
    },
  });

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
          <p className="text-sm text-gray-700">
            {answers.map((answer: any) => (
              <div key={answer.id}>
                <h3 className="text-base font-medium mb-2">
                  {answer.question.questionText}
                </h3>
                <p className="text-sm text-gray-700">{answer.answer}</p>
              </div>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}
