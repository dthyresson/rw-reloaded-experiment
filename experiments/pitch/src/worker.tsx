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
import { RouteContext } from "@redwoodjs/sdk/router";

type Context = {
  id: string;
};

export default defineApp<Context>([
  async ({ ctx, env, request }) => {
    await setupDb(env);
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
  ]),
]);
