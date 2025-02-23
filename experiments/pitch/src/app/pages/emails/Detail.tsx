import { db } from "@/db";
import { link } from "@/app/shared/links";
import { Card, CardHeader, CardContent } from "@/app/components/ui/card";
import { RouteContext } from "@redwoodjs/sdk/router";
import { EmailSummary } from "@/app/pages/submissions/EmailSummary";
import { getSummaryStream } from "@/app/services/summaryService";

export async function Detail({ params }: RouteContext<{ id: string }>) {
  const emailSubmission = await db.emailSubmission.findUnique({
    include: {
      submission: true,
    },
    where: { id: params.id },
  });

  if (!emailSubmission) {
    return <div>Email submission not found</div>;
  }

  const summaryStream = await getSummaryStream(
    emailSubmission.submission.id,
    emailSubmission.content,
  );

  return (
    <div className="max-w-auto mx-auto p-6">
      <nav className="flex gap-2 mb-6 items-center">
        <a href={link("/emails")} className="hover:underline">
          Emails
        </a>
        <div className="h-4 w-px bg-gray-300"></div>
        <span>View</span>
      </nav>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Email Submission</h1>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Summary</h2>
                <pre className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap">
                  {emailSubmission.content}
                </pre>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Analysis</h3>
                <div className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap">
                  <EmailSummary stream={summaryStream} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
