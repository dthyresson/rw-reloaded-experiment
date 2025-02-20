// Hint: Seeeding data should look at ./prisma/schema.prisma
import { defineScript } from "@redwoodjs/sdk/worker";
import { db, setupDb } from "../db";
import { QuestionType, CurrencyType } from "@prisma/client";

export default defineScript(async ({ env }) => {
  setupDb(env);

  await db.$executeRawUnsafe(`\
    DELETE FROM Answer;
    DELETE FROM Question;
    DELETE FROM QuestionSet;
    DELETE FROM Submission;
    DELETE FROM Otp;
    DELETE FROM User;
    DELETE FROM sqlite_sequence;
  `);

  await db.user.createMany({
    data: [
      {
        email: "dt@pwv.com",
        name: "DT",
      },
      {
        email: "david@pwv.com",
        name: "David",
      },
      {
        email: "tom@pwv.com",
        name: "Tom",
      },
      {
        email: "jen@pwv.com",
        name: "Jen",
      },
    ],
  });

  await db.questionSet.create({
    data: {
      name: "Pitch",
      versionNumber: 1,
      isActive: true,
      questions: {
        create: [
          {
            questionText: "What is your name?",
            questionType: QuestionType.TEXT,
            questionPosition: 0,
            isRequired: true,
          },
          {
            questionText: "What is your age?",
            questionType: QuestionType.NUMBER,
            questionPosition: 1,
            isRequired: true,
          },
          {
            questionText: "Are you currently employed?",
            questionType: QuestionType.BOOLEAN,
            questionPosition: 2,
            isRequired: true,
          },
          {
            questionText: "What is your current salary?",
            questionType: QuestionType.CURRENCY,
            questionPosition: 3,
            isRequired: false,
          },
        ],
      },
    },
  });

  // submission
  const user = await db.user.findUnique({
    where: { email: "dt@pwv.com" },
  });

  const questionSet = await db.questionSet.findFirst({
    where: { name: "Pitch", versionNumber: 1 },
    include: { questions: true },
  });

  if (!user || !questionSet) {
    throw new Error("User or QuestionSet not found");
  }

  const submission = await db.submission.create({
    data: {
      userId: user.id,
      questionSetId: questionSet.id,
      status: "IN_PROGRESS",
    },
  });

  console.log(questionSet.questions);
  console.log(submission);

  // Create answers one by one
  for (const question of questionSet.questions) {
    await db.answer.create({
      data: {
        submissionId: submission.id,
        questionId: question.id,
        // Provide appropriate sample answers based on question type
        ...(question.questionType === QuestionType.TEXT && {
          answerText: "Sample Text",
        }),
        ...(question.questionType === QuestionType.NUMBER && {
          answerNumber: 42,
        }),
        ...(question.questionType === QuestionType.BOOLEAN && {
          answerBoolean: 1,
        }),
        ...(question.questionType === QuestionType.CURRENCY && {
          answerCurrency: 75000,
          currencyType: CurrencyType.USD,
        }),
        ...(question.questionType === QuestionType.FILE && {
          fileUrl: "https://example.com/sample-file.pdf",
        }),
        ...(question.questionType === QuestionType.DATE && {
          answerDate: new Date("2024-03-15"),
        }),
        ...(question.questionType === QuestionType.DATETIME && {
          answerDatetime: new Date("2024-03-15T14:30:00Z"),
        }),
        ...(question.questionType === QuestionType.PHONE && {
          phone: "+1-555-123-4567",
        }),
        ...(question.questionType === QuestionType.URL && {
          url: "https://example.com",
        }),
      },
    });
  }

  console.log("🌱 Finished seeding");
});
