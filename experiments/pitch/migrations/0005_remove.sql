-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Answer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "submissionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
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
INSERT INTO "new_Answer" ("answerBoolean", "answerCurrency", "answerDate", "answerDatetime", "answerNumber", "answerText", "createdAt", "currencyType", "fileUrl", "id", "phone", "questionId", "submissionId", "updatedAt", "url") SELECT "answerBoolean", "answerCurrency", "answerDate", "answerDatetime", "answerNumber", "answerText", "createdAt", "currencyType", "fileUrl", "id", "phone", "questionId", "submissionId", "updatedAt", "url" FROM "Answer";
DROP TABLE "Answer";
ALTER TABLE "new_Answer" RENAME TO "Answer";
CREATE UNIQUE INDEX "Answer_submissionId_questionId_key" ON "Answer"("submissionId", "questionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
