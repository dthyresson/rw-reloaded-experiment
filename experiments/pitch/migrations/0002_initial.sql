-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Answer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "submissionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "answerText" TEXT,
    "answerNumber" REAL,
    "answerBoolean" INTEGER,
    "answerCurrency" REAL,
    "currencyType" TEXT DEFAULT 'USD',
    "fileUrl" TEXT,
    "answerDate" DATETIME,
    "answerDatetime" DATETIME,
    "phone" TEXT,
    "url" TEXT,
    CONSTRAINT "Answer_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Answer" ("answerBoolean", "answerCurrency", "answerDate", "answerDatetime", "answerNumber", "answerText", "createdAt", "currencyType", "fileUrl", "id", "phone", "questionId", "questionType", "submissionId", "updatedAt", "url") SELECT "answerBoolean", "answerCurrency", "answerDate", "answerDatetime", "answerNumber", "answerText", "createdAt", "currencyType", "fileUrl", "id", "phone", "questionId", "questionType", "submissionId", "updatedAt", "url" FROM "Answer";
DROP TABLE "Answer";
ALTER TABLE "new_Answer" RENAME TO "Answer";
CREATE UNIQUE INDEX "Answer_submissionId_questionId_key" ON "Answer"("submissionId", "questionId");
CREATE TABLE "new_Otp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "otpCode" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" DATETIME,
    CONSTRAINT "Otp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Otp" ("createdAt", "expiresAt", "id", "otpCode", "updatedAt", "usedAt", "userId") SELECT "createdAt", "expiresAt", "id", "otpCode", "updatedAt", "usedAt", "userId" FROM "Otp";
DROP TABLE "Otp";
ALTER TABLE "new_Otp" RENAME TO "Otp";
CREATE TABLE "new_Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "questionSetId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "description" TEXT,
    "placeholder" TEXT,
    "questionType" TEXT NOT NULL,
    "questionPosition" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Question_questionSetId_fkey" FOREIGN KEY ("questionSetId") REFERENCES "QuestionSet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Question" ("createdAt", "description", "id", "isRequired", "placeholder", "questionPosition", "questionSetId", "questionText", "questionType", "updatedAt") SELECT "createdAt", "description", "id", "isRequired", "placeholder", "questionPosition", "questionSetId", "questionText", "questionType", "updatedAt" FROM "Question";
DROP TABLE "Question";
ALTER TABLE "new_Question" RENAME TO "Question";
CREATE UNIQUE INDEX "Question_questionSetId_questionPosition_key" ON "Question"("questionSetId", "questionPosition");
CREATE TABLE "new_QuestionSet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_QuestionSet" ("createdAt", "id", "isActive", "name", "updatedAt", "versionNumber") SELECT "createdAt", "id", "isActive", "name", "updatedAt", "versionNumber" FROM "QuestionSet";
DROP TABLE "QuestionSet";
ALTER TABLE "new_QuestionSet" RENAME TO "QuestionSet";
CREATE UNIQUE INDEX "QuestionSet_name_versionNumber_key" ON "QuestionSet"("name", "versionNumber");
CREATE TABLE "new_Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "userId" TEXT NOT NULL,
    "questionSetId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Submission_questionSetId_fkey" FOREIGN KEY ("questionSetId") REFERENCES "QuestionSet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Submission" ("completedAt", "createdAt", "id", "questionSetId", "status", "updatedAt", "userId") SELECT "completedAt", "createdAt", "id", "questionSetId", "status", "updatedAt", "userId" FROM "Submission";
DROP TABLE "Submission";
ALTER TABLE "new_Submission" RENAME TO "Submission";
CREATE UNIQUE INDEX "Submission_userId_status_key" ON "Submission"("userId", "status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
