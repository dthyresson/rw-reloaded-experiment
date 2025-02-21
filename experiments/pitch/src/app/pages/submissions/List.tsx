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

export async function List() {
  const submissions = await getLatestSubmissions();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Submissions</h1>
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
                {new Date(submission.createdAt).toISOString()}
              </TableCell>
              <TableCell>
                {new Date(submission.updatedAt).toISOString()}
              </TableCell>
              <TableCell>{submission.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
