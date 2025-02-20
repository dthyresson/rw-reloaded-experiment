// Hint: Seeeding data should look at ./prisma/schema.prisma
import { defineScript } from "@redwoodjs/sdk/worker";
import { db, setupDb } from "../db";
// @ts-ignore
import { QuestionType, CurrencyType } from "@prisma/client";

export default defineScript(async ({ env }) => {
  try {
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

    // Get all users and create submissions for each
    const users = await db.user.findMany();

    const questionSet = await db.questionSet.findFirst({
      where: { name: "Pitch", versionNumber: 1 },
      include: { questions: true },
    });

    if (!questionSet) {
      throw new Error("QuestionSet not found");
    }

    // Create submissions for each user
    for (const user of users) {
      const submission = await db.submission.create({
        data: {
          userId: user.id,
          questionSetId: questionSet.id,
          status: "IN_PROGRESS",
        },
      });

      console.log(`Created submission for ${user.name}:`, submission);

      // Create answers for each question
      for (const question of questionSet.questions) {
        try {
          const answerData: any = {
            submissionId: submission.id,
            questionId: question.id,
          };

          // Set the appropriate answer field based on question type
          switch (question.questionType) {
            case QuestionType.TEXT:
              answerData.answerText = user.name;
              break;
            case QuestionType.NUMBER:
              answerData.answerNumber = Math.floor(Math.random() * 100);
              break;
            case QuestionType.BOOLEAN:
              answerData.answerBoolean = 1; // 1 for true, 0 for false
              break;
            case QuestionType.CURRENCY:
              answerData.answerCurrency = Math.floor(Math.random() * 10_000);
              answerData.currencyType = CurrencyType.USD;
              break;
            default:
              answerData.answerText = "Sample Text";
          }

          console.log("Creating answer with data:", answerData);
          await db.answer.create({
            data: answerData,
          });
        } catch (error) {
          console.error(
            `Failed to create answer for question ${question.id}:`,
            error,
          );
          throw error; // Re-throw to stop the seeding process
        }
      }
    }

    console.log("🌱 Finished seeding successfully");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
});
