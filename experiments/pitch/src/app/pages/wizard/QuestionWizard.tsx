"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { QuestionForm } from "./QuestionForm";
import { useQuestionSet } from "./hooks/useQuestionSet";

interface QuestionWizardProps {
  submissionId: string;
  currentQuestionIndex: number;
}

export function QuestionWizard({
  submissionId,
  currentQuestionIndex,
}: QuestionWizardProps) {
  const [currentIndex, setCurrentIndex] = useState(currentQuestionIndex);
  const { questions, isLoading, error } = useQuestionSet(submissionId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading questions</div>;
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
          <h2 className="text-2xl font-bold">{currentQuestion.questionText}</h2>
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
