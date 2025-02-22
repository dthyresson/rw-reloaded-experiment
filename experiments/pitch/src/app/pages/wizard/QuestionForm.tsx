"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { saveAnswer } from "./functions";
// @ts-ignore
import type { Question } from "@prisma/client";

interface QuestionFormProps {
  question: Question;
  submissionId: string;
  onComplete: () => void;
}

export function QuestionForm({
  question,
  submissionId,
  onComplete,
}: QuestionFormProps) {
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setValue("");
  }, [question.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await saveAnswer({
        submissionId,
        questionId: question.id,
        value,
        type: question.questionType,
      });
      onComplete();
    } catch (error) {
      console.error("Failed to save answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = () => {
    switch (question.questionType) {
      case "TEXT":
        return (
          <Input
            placeholder={question.placeholder || "Enter your answer"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        );

      case "BOOLEAN":
        return (
          <div className="flex gap-4">
            <Button
              variant={value === "true" ? "default" : "outline"}
              onClick={() => setValue("true")}
            >
              Yes
            </Button>
            <Button
              variant={value === "false" ? "default" : "outline"}
              onClick={() => setValue("false")}
            >
              No
            </Button>
          </div>
        );

      case "URL":
        return (
          <Input
            type="url"
            placeholder="https://example.com"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        );

      case "FILE":
        return (
          <Input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // Handle file upload
                setValue(file.name);
              }
            }}
          />
        );

      default:
        return (
          <Input value={value} onChange={(e) => setValue(e.target.value)} />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {renderInput()}
      <Button
        type="submit"
        disabled={isSubmitting || !value}
        className="w-full"
      >
        {isSubmitting ? "Saving..." : "Continue"}
      </Button>
    </form>
  );
}
