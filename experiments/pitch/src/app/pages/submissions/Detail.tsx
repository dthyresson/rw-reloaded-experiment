import { RouteContext } from "@redwoodjs/sdk/router";
import { getSubmission } from "@/app/services/submissions";
import { SubmissionCard } from "@/app/pages/submissions/SubmissionCard";

export async function Detail({ params, ctx }: RouteContext<{ id: string }>) {
  const submission = await getSubmission(params.id);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <SubmissionCard submission={submission} />
    </div>
  );
}
