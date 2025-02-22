import { db } from "@/db";
import { QuestionWizard } from "./QuestionWizard";

// Hardcoded for demo
const DEMO_USER_ID = "01f974cb-4a2f-4993-b948-4d7e2ac12885";
const DEMO_QUESTION_SET_ID = "cm7gb0wm70000wy0nf2yeh5hu";

export async function Start() {
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
