import { RouteContext } from "@redwoodjs/sdk/router";
import { getSubmission } from "@/app/services/submissions";
import { SubmissionCard } from "@/app/pages/submissions/SubmissionCard";
import { link } from "@/app/shared/links";

export async function Detail({ params, ctx }: RouteContext<{ id: string }>) {
  const submission = await getSubmission(params.id);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <SubmissionCard submission={submission} />
      <a
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-primary underline-offset-4 hover:underline"
        href={link("/submissions/:id/edit", { id: submission.id })}
      >
        Edit
      </a>
    </div>
  );
}
