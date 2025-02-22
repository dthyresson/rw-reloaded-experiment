import { RouteContext } from "@redwoodjs/sdk/router";
import { getLatestSubmissions } from "@/app/services/submissions";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/app/components/ui/table";
import { link } from "@/app/shared/links";
import { formatDistanceToNow, format, differenceInHours } from "date-fns";

export async function List() {
  const submissions = await getLatestSubmissions();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <nav className="flex gap-2 mb-6 items-center">
        <a href={link("/")} className="hover:underline">
          Home
        </a>
        <div className="h-4 w-px bg-gray-300"></div>
        <a href={link("/submissions")} className="hover:underline">
          Submissions
        </a>
      </nav>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Submissions</h1>
        <a
          href={link("/wizard/start")}
          className="bg-blue-500 text-white rounded-md p-2"
        >
          New Submission
        </a>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>By</TableHead>
            <TableHead>Question Set</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission: any) => (
            <TableRow key={submission.id}>
              <TableCell>
                <a
                  className="underline-offset-4 hover:underline"
                  href={link("/submissions/:id", { id: submission.id })}
                >
                  {submission.user.name}
                </a>
              </TableCell>
              <TableCell>
                <a
                  className="underline-offset-4 hover:underline"
                  href={link("/questions/:id", {
                    id: submission.questionSet.id,
                  })}
                >
                  {submission.questionSet.name}
                </a>
              </TableCell>
              <TableCell>
                {(() => {
                  const date = new Date(submission.createdAt);
                  return differenceInHours(new Date(), date) > 24
                    ? format(date, "MMM d, yyyy h:mm a")
                    : formatDistanceToNow(date, { addSuffix: true });
                })()}
              </TableCell>
              <TableCell>
                {(() => {
                  const date = new Date(submission.updatedAt);
                  return differenceInHours(new Date(), date) > 24
                    ? format(date, "MMM d, yyyy h:mm a")
                    : formatDistanceToNow(date, { addSuffix: true });
                })()}
              </TableCell>
              <TableCell>{submission.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
