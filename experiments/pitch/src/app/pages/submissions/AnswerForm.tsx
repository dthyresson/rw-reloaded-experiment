"use client";

import React, { useState } from "react";
// import { RouteContext } from "@redwoodjs/sdk/router";
import { updateAnswer } from "@/app/services/submissions";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { toast, Toaster } from "sonner";

function AnswerForm(props: {
  answerId: string;
  questionText: string;
  answerText: string;
}) {
  const [answerText, setAnswerText] = useState(props.answerText || "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!answerText) return;

    setIsSaving(true);
    try {
      await updateAnswer(props.answerId, answerText);
      toast.success("Answer saved successfully");
    } catch (error) {
      console.error("Failed to update answer:", error);
      toast.error("Failed to save answer");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <Toaster />
      <CardHeader>
        <CardTitle>Question</CardTitle>
        <p className="mt-2 text-gray-600">{props.questionText}</p>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <FormField
            name="answerText"
            render={() => (
              <FormItem>
                <FormLabel>Answer</FormLabel>
                <FormControl>
                  <Input
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    required
                    disabled={isSaving}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Answer"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default AnswerForm;
