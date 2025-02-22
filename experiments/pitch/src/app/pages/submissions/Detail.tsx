import { RouteContext } from "@redwoodjs/sdk/router";
import { getSubmission } from "@/app/services/submissions";
import { SubmissionCard } from "@/app/pages/submissions/SubmissionCard";
import { link } from "@/app/shared/links";

export async function Detail({ params, ctx }: RouteContext<{ id: string }>) {
  const submission = await getSubmission(params.id);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <nav className="flex gap-2 mb-6 items-center">
        <a href={link("/")} className="hover:underline">
          Home
        </a>
        <div className="h-4 w-px bg-gray-300"></div>
        <a href={link("/submissions")} className="hover:underline">
          Submissions
        </a>
        <div className="h-4 w-px bg-gray-300"></div>
        <span>{submission.user.name}'s Submission</span>
      </nav>
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
