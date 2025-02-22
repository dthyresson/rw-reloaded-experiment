// Hint: Seeeding data should look at ./prisma/schema.prisma
import { defineScript } from "@redwoodjs/sdk/worker";
import { db, setupDb } from "../db";
// @ts-ignore
import { QuestionType } from "@prisma/client";
import { startups } from "./data";

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

    // Create users from startups data
    await db.user.createMany({
      data: startups.map((startup) => ({
        name: startup.name,
        email: `founder@${startup.domain}`,
      })),
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

    const questionSet = await db.questionSet.findFirst({
      where: { name: "Pitch", versionNumber: 1 },
      include: { questions: true },
    });

    if (!questionSet) {
      throw new Error("QuestionSet not found");
    }

    // Create submissions for each startup
    for (const startup of startups) {
      // find user by email
      const user = await db.user.findFirst({
        where: { email: `founder@${startup.domain}` },
      });

      if (!user) {
        throw new Error(`User not found for ${startup.name}`);
      }

      await db.submission.create({
        data: {
          userId: user.id,
          questionSetId: questionSet.id,
          status: "COMPLETED",
          answers: {
            create: questionSet.questions.map((question: any) => {
              let answerContent = "";

              // Find the submission answer for this question position
              const submissionAnswer = startup.submission?.find(
                (q) => q.questionPosition === question.questionPosition,
              )?.answer;

              // Set answer content based on question position first
              switch (question.questionPosition) {
                case 0: // Name
                  answerContent = submissionAnswer || startup.name;
                  break;
                case 1: // Company description
                  answerContent =
                    submissionAnswer ||
                    `${startup.name} is innovating in the ${startup.sector} space.`;
                  break;
                case 2: // About founder
                  answerContent =
                    submissionAnswer ||
                    `Experienced founder with background in ${startup.sector}.`;
                  break;
                case 3: // Progress
                  answerContent =
                    submissionAnswer ||
                    "Early stage startup with MVP in development.";
                  break;
                case 4: // Have you raised outside capital?
                  answerContent = submissionAnswer
                    ? String(submissionAnswer === "Yes")
                    : "false";
                  break;
                case 5: // Funding details
                  answerContent = submissionAnswer || "";
                  break;
                case 6: // LinkedIn URL
                  answerContent =
                    submissionAnswer ||
                    `https://linkedin.com/in/${startup.name.toLowerCase().replace(/\s+/g, "-")}`;
                  break;
                case 7: // Website URL
                  answerContent = submissionAnswer
                    ? `https://${submissionAnswer}`
                    : `https://${startup.domain}`;
                  break;
                case 8: // How heard about PWV
                  answerContent = submissionAnswer || "";
                  break;
                case 9: // Pitch deck file
                  answerContent =
                    submissionAnswer ||
                    `${startup.name.toLowerCase().replace(/\s+/g, "-")}-deck.pdf`;
                  break;
                case 10: // Company category
                  answerContent = submissionAnswer || startup.sector;
                  break;
                case 11: // Referral
                  answerContent = submissionAnswer || "";
                  break;
              }

              // Return the answer in the correct format based on question type
              return {
                questionId: question.id,
                ...(question.questionType === QuestionType.TEXT && {
                  answerText: answerContent,
                }),
                ...(question.questionType === QuestionType.BOOLEAN && {
                  answerBoolean: answerContent === "true" ? 1 : 0,
                }),
                ...(question.questionType === QuestionType.URL && {
                  url: answerContent,
                }),
                ...(question.questionType === QuestionType.FILE && {
                  fileUrl: answerContent,
                }),
              };
            }),
          },
        },
      });
    }

    console.log("🌱 Finished seeding successfully");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
});
