import { defineApp } from "@redwoodjs/sdk/worker";
import { index, layout, prefix, route } from "@redwoodjs/sdk/router";
import { Document } from "src/Document";
import { Home } from "src/pages/Home";
import { List } from "src/pages/submissions/List";
import { Detail } from "src/pages/submissions/Detail";
import { Detail as QuestionDetail } from "src/pages/questions/Detail";

import { setupDb } from "./db";
import { Edit } from "src/pages/submissions/Edit";
import { db } from "@/db";

type Context = {
  id: string;
};

// type RouteContext = {};

export default defineApp<Context>([
  async ({ ctx, env, request }) => {
    await setupDb(env);
  },
  layout(Document, [
    index<Context>([Home]),
    route("/hello", function ({ ctx }: { ctx: Context }) {
      return new Response("Hello, world!");
    }),
    prefix("/submissions", [
      // @ts-ignore
      route<Context>("/", List),
      route<Context>("/:id", Detail),
      route<Context>("/:id/edit", Edit),
    ]),
    prefix("/questions", [
      route<Context>("/:id", QuestionDetail),
      route<Context>("/:id/upload", async ({ request, params, env, ctx }) => {
        if (
          request.method !== "POST" &&
          !request.headers.get("content-type")?.includes("multipart/form-data")
        ) {
          return new Response("Method not allowed", { status: 405 });
        }

        console.log("Uploading file for question", params.id);

        const formData = await request.formData();
        const file = formData.get("file") as File;

        console.log("File", file);

        // Stream the file directly to R2
        const r2ObjectKey = `/submissions/questions/${params.id}/files/${Date.now()}-${file.name}`;
        await env.R2.put(r2ObjectKey, file.stream(), {
          httpMetadata: {
            contentType: file.type,
          },

        });

        console.log("Updating answer", params.id, "with", r2ObjectKey);

        await db.answer.update({
          where: {
            submissionId_questionId: {
              questionId: params.id,
              submissionId: "cm7eybh9m000eun0nxdi1mz6d",
            },
          },
          data: {
            answerText: r2ObjectKey,
            fileUrl: r2ObjectKey,
          },
        });

        return new Response(JSON.stringify({ key: r2ObjectKey }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }),
    ]),
  ]),
]);
