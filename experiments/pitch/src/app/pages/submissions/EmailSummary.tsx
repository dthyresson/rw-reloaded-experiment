"use client";

import React, { useEffect, useState } from "react";
import type { RunResponseStream } from "langbase";
import { getRunner } from "langbase";
interface EmailSummaryProps {
  stream: RunResponseStream;
}

export function EmailSummary({ stream }: EmailSummaryProps) {
  const [summary, setSummary] = useState("");

  useEffect(() => {
    async function readStream() {
      // Convert the stream to a stream runner.
      const runner = getRunner(stream.stream);

      runner.on("content", (content) => {
        setSummary((prev) => prev + content);
      });

      runner.on("error", (error) => {
        console.error("Error:", error);
      });
    }

    readStream();
  }, [stream]);

  return (
    <pre className="text-sm text-gray-700 prose prose-sm max-w-none whitespace-pre-wrap">
      {summary}
    </pre>
  );
}
