import { RouteContext } from "@redwoodjs/sdk/router";
import { allSubmissions } from "@/app/services/submissions";
import { SubmissionCard } from "@/app/pages/submissions/SubmissionCard";

export async function List({ ctx }: RouteContext<{}>) {
  const submissions = await allSubmissions();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {submissions.map((submission: any) => (
        <SubmissionCard key={submission.id} submission={submission} />
      ))}
    </div>
  );
}
