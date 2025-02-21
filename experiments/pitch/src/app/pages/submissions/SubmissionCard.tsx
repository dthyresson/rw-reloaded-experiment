import { link } from "src/shared/links";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";

export function SubmissionCard({ submission }: { submission: any }) {
  if (!submission) return null;

  return (
    <Card>
      <CardHeader>
        <a href={link("/submissions/:id", { id: submission.id })}>
          Submitted by {submission.user.name}
        </a>
      </CardHeader>
      <CardContent className="space-y-4">
        {submission.answers.map((answer: any) => (
          <div key={answer.id} className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-600">
              {answer.question.questionText}
            </span>
            <div className="text-gray-800">
              {(() => {
                switch (answer.question.questionType) {
                  case "TEXT":
                    return answer.answerText;
                  case "NUMBER":
                    return answer.answerNumber;
                  case "BOOLEAN":
                    return answer.answerBoolean ? "Yes" : "No";
                  case "CURRENCY":
                    return `${answer.currencyType} ${answer.answerCurrency?.toFixed(2)}`;
                  case "FILE":
                    return answer.fileUrl ? (
                      <a
                        href={answer.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        View File
                      </a>
                    ) : null;
                  case "DATE":
                    return answer.answerDate?.toLocaleDateString();
                  case "DATETIME":
                    return answer.answerDatetime?.toLocaleString();
                  case "PHONE":
                    return answer.phone;
                  case "URL":
                    return answer.url ? (
                      <a
                        href={answer.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {answer.url}
                      </a>
                    ) : null;
                  default:
                    return "Unknown answer type";
                }
              })()}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
