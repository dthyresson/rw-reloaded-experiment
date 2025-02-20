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
              questionText: "Tell us about your company, product, or idea.",
              description:
                "Provide a clear and concise overview of what you're working on",
              questionType: QuestionType.TEXT,
              questionPosition: 1,
              isRequired: true,
            },
            {
              questionText: "Tell us about yourself.",
              description: "Who are you and why are you working on this?",
              questionType: QuestionType.TEXT,
              questionPosition: 2,
              isRequired: true,
            },
            {
              questionText: "How far along are you?",
              description:
                "Tell us about your journey so far and how PWV can help. Tell us about any customers.",
              questionType: QuestionType.TEXT,
              questionPosition: 3,
              isRequired: true,
            },
            {
              questionText: "Have you raised outside capital?",
              questionType: QuestionType.BOOLEAN,
              questionPosition: 4,
              isRequired: true,
            },
            {
              questionText:
                "Who have you raised from and what were the round and terms?",
              questionType: QuestionType.TEXT,
              questionPosition: 5,
              isRequired: true,
            },
            {
              questionText: "Where can we find you on LinkedIn?",
              questionType: QuestionType.URL, // Note: Should be URL if available in schema
              questionPosition: 6,
              isRequired: false,
            },
            {
              questionText:
                "Feel free to share your website here if you have one.",
              questionType: QuestionType.URL, // Note: Should be URL if available in schema
              questionPosition: 7,
              isRequired: false,
            },
            {
              questionText: "How did you hear about PWV?",
              description: "Who do you know that we might know?",
              questionType: QuestionType.TEXT,
              questionPosition: 8,
              isRequired: true,
            },
            {
              questionText:
                "Please attach any supporting files, like a deck, demo, etc.",
              questionType: QuestionType.FILE, // Note: Should be FILE if available in schema
              questionPosition: 9,
              isRequired: true,
            },
            {
              questionText: "How would you categorize your company?",
              description:
                "Select the category that best describes your company",
              questionType: QuestionType.TEXT,
              questionPosition: 10,
              isRequired: true,
            },
            {
              questionText: "Were you referred by someone?",
              questionType: QuestionType.TEXT,
              questionPosition: 11,
              isRequired: true,
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
            case QuestionType.FILE:
              answerData.fileUrl = "https://example.com/file.pdf";
              break;
            case QuestionType.DATE:
              answerData.answerDate = new Date();
              break;
            case QuestionType.DATETIME:
              answerData.answerDatetime = new Date();
              break;
            case QuestionType.PHONE:
              answerData.phone = "+1234567890";
              break;
            case QuestionType.URL:
              answerData.url = "https://example.com";
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
