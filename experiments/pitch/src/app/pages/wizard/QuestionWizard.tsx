"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { QuestionForm } from "./QuestionForm";

interface QuestionWizardProps {
  submissionId: string;
  currentQuestionIndex: number;
  questions: any[]; // Update this type to match your Question type
}

export function QuestionWizard({
  submissionId,
  currentQuestionIndex,
  questions,
}: QuestionWizardProps) {
  const [currentIndex, setCurrentIndex] = useState(currentQuestionIndex);

  if (!questions?.length) return <div>No questions found</div>;

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleNext = async () => {
    if (isLastQuestion) {
      // Complete submission
      await fetch(`/api/submissions/${submissionId}/complete`, {
        method: "POST",
      });
      // router.push(`/submissions/${submissionId}`);
      window.location.href = `/submissions/${submissionId}`;
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </div>
          <div className="flex items-center gap-1">
            <h2 className="text-2xl font-bold">
              {currentQuestion.questionText}
            </h2>
          </div>
          {currentQuestion.description && (
            <p className="text-muted-foreground">
              {currentQuestion.description}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <QuestionForm
            question={currentQuestion}
            submissionId={submissionId}
            onComplete={handleNext}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => prev - 1)}
          >
            Previous
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
