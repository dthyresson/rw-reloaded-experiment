import { defineApp } from "@redwoodjs/sdk/worker";
import { index, layout, prefix, route } from "@redwoodjs/sdk/router";
import { Document } from "src/Document";
import { Home } from "@/app/pages/Home";
import { List } from "@/app/pages/submissions/List";
import { Detail } from "@/app/pages/submissions/Detail";
import { Detail as QuestionDetail } from "@/app/pages/questions/Detail";
import { List as EmailList } from "@/app/pages/emails/List";
import { Detail as EmailDetail } from "@/app/pages/emails/Detail";
import { New as EmailNew } from "@/app/pages/emails/New";

import { setupDb } from "./db";
import { Edit } from "src/pages/submissions/Edit";
import { db } from "@/db";
// import { RouteContext } from "@redwoodjs/sdk/router";
import { Start as WizardStart } from "./app/pages/wizard/Start";
import { setupLangbase } from "./langbase";
type Context = {
  id: string;
};

export default defineApp<Context>([
  async ({ ctx, env, request }) => {
    await setupDb(env);
    await setupLangbase(env);
  },
  layout(Document, [
    index<Context>([List]),
    route("/hello", function ({ ctx }: { ctx: Context }) {
      return new Response("Hello, world!");
    }),
    route("/home", [Home]),
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
              submissionId: "cm7dvjo6n007wz10nvyz2o1fq",
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
      route("/files/*", async ({ request, params, env }) => {
        try {
          console.log("Serving file", params);
          const key = `/${params["$0"]}`;
          console.log("Key", key);
          const object = await env.R2.get(key);
          console.log("Object", object);

          if (!object) {
            return new Response("File not found", { status: 404 });
          }

          const headers = new Headers();
          headers.set(
            "Content-Type",
            object.httpMetadata?.contentType || "application/octet-stream",
          );

          // For direct viewing in browser (like images)
          if (request.headers.get("Accept")?.includes("image/")) {
            return new Response(object.body, { headers });
          }

          // For file downloads
          headers.set(
            "Content-Disposition",
            `attachment; filename="${key.split("/").pop()}"`,
          );
          return new Response(object.body, { headers });
        } catch (error) {
          console.error("Error serving file:", error);
          return new Response("Error serving file", { status: 500 });
        }
      }),
    ]),
    prefix("/emails", [
      route<Context>("/", EmailList),
      route<Context>("/new", EmailNew),
      route<Context>("/:id", EmailDetail),
    ]),
  ]),
  route("/wizard/start", [WizardStart]),
  route("/api/submissions/:id/questions", async ({ params }) => {
    const submission = await db.submission.findUnique({
      where: { id: params.id },
      include: { questionSet: { include: { questions: true } } },
    });
    return new Response(JSON.stringify(submission.questionSet.questions));
  }),
  route(
    "/api/submissions/:submissionId/answers/:questionId",
    async ({ params }) => {
      const answer = await db.answer.findUnique({
        where: {
          submissionId_questionId: {
            submissionId: params.submissionId,
            questionId: params.questionId,
          },
        },
      });
      return new Response(JSON.stringify({ value: answer?.answerText }), {
        headers: { "Content-Type": "application/json" },
      });
    },
  ),
  route("/api/submissions/:id/complete", async ({ params }) => {
    try {
      await db.submission.update({
        where: { id: params.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      //here i want to query all the submission's questions and answers
      const submission = await db.submission.findUnique({
        where: { id: params.id },
        include: {
          questionSet: {
            include: {
              questions: {
                include: { answers: { include: { question: true } } },
              },
            },
          },
        },
      });

      // the save to submission.raw the questions and answers as json
      await db.submission.update({
        where: { id: params.id },
        data: {
          raw: submission,
        },
      });

      return new Response(null, { status: 200 });
    } catch (error) {
      console.error("Error completing submission", error);
      return new Response("Error completing submission", { status: 500 });
    }
  }),
  route("/api/emails", async ({ request }) => {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const { content } = await request.json();
      // get first question set
      const questionSet = await db.questionSet.findFirst({
        where: {
          isActive: true,
        },
      });

      const emailSubmission = await db.emailSubmission.create({
        data: {
          content,
          submission: {
            create: {
              user: {
                create: {
                  email: `user_${Math.random().toString(36).substring(2)}@example.com`,
                },
              },
              questionSet: {
                connect: {
                  id: questionSet.id,
                },
              },
              status: "COMPLETED",
              completedAt: new Date(),
            },
          },
        },
      });

      return new Response(JSON.stringify(emailSubmission), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error creating email submission:", error);
      return new Response("Error creating email submission", { status: 500 });
    }
  }),
]);
