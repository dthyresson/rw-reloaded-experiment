import { db } from "@/db";
import { QuestionWizard } from "./QuestionWizard";
import { link } from "src/shared/links";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/app/components/ui/card";

// Hardcoded for demo
// get first user
async function getFirstUserId() {
  const users = await db.user.findMany({
    take: 1,
    orderBy: { name: "desc" },
  });
  return users[0].id;
}

// get first question set
async function getFirstQuestionSetId() {
  const questionSets = await db.questionSet.findMany({ take: 1 });
  return questionSets[0].id;
}

export async function Start() {
  const DEMO_USER_ID = await getFirstUserId();
  const DEMO_QUESTION_SET_ID = await getFirstQuestionSetId();

  // Fetch questions for the question set
  const questions = await db.question.findMany({
    where: { questionSetId: DEMO_QUESTION_SET_ID },
    orderBy: { questionPosition: "asc" },
  });

  // check for completed submission
  const completedSubmission = await db.submission.findFirst({
    where: {
      userId: DEMO_USER_ID,
      questionSetId: DEMO_QUESTION_SET_ID,
      status: "COMPLETED",
    },
  });

  if (completedSubmission) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card>
          <CardHeader>
            <CardTitle>You have already completed a pitch.</CardTitle>
          </CardHeader>
          <CardFooter>
            <a
              href={link(`/submissions/:id`, { id: completedSubmission.id })}
              className="text-primary hover:text-primary/80 font-medium"
            >
              View submission →
            </a>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Check for existing in-progress submission
  const existingSubmission = await db.submission.findFirst({
    where: {
      userId: DEMO_USER_ID,
      questionSetId: DEMO_QUESTION_SET_ID,
      status: "IN_PROGRESS",
    },
  });

  if (!existingSubmission) {
    const submission = await db.submission.create({
      data: {
        userId: DEMO_USER_ID,
        questionSetId: DEMO_QUESTION_SET_ID,
        status: "IN_PROGRESS",
      },
    });
    return (
      <QuestionWizard
        submissionId={submission.id}
        currentQuestionIndex={0}
        questions={questions}
      />
    );
  }

  return (
    <QuestionWizard
      submissionId={existingSubmission.id}
      currentQuestionIndex={0}
      questions={questions}
    />
  );
}
