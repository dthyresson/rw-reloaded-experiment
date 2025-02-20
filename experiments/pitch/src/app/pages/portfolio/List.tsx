import { RouteContext } from "@redwoodjs/sdk/router";
import { db } from "@/db";
import { link } from "src/shared/links";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";

export async function List({ ctx }: RouteContext<{}>) {
  const answers = await db.submission.findMany({
    include: {
      user: true,
      answers: {
        include: {
          question: true,
        },
      },
    },
  });
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {answers.map((answer: any) => (
        <Card key={answer.id}>
          <CardHeader>
            <a href={link("/portfolio/:id", { id: answer.id })}>
              Submitted by {answer.user.name}
            </a>
          </CardHeader>
          <CardContent className="space-y-4">
            {answer.answers.map((answer: any) => (
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
      ))}
    </div>
  );
}
