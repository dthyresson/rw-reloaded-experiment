import { db } from "@/db";
import { QuestionWizard } from "./QuestionWizard";

// Hardcoded for demo
// get first user
async function getFirstUserId() {
  const users = await db.user.findMany({ take: 1 });
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
  // Check for existing in-progress submission
  const existingSubmission = await db.submission.findFirst({
    where: {
      userId: DEMO_USER_ID,
      questionSetId: DEMO_QUESTION_SET_ID,
      status: "IN_PROGRESS",
    },
  });

  if (!existingSubmission) {
    // Create new submission
    const submission = await db.submission.create({
      data: {
        userId: DEMO_USER_ID,
        questionSetId: DEMO_QUESTION_SET_ID,
        status: "IN_PROGRESS",
      },
    });
    return (
      <QuestionWizard submissionId={submission.id} currentQuestionIndex={0} />
    );
  }

  return (
    <QuestionWizard
      submissionId={existingSubmission.id}
      currentQuestionIndex={0}
    />
  );
}
