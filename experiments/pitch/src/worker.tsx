import { defineApp } from "@redwoodjs/sdk/worker";
import { index, layout, prefix, route } from "@redwoodjs/sdk/router";
import { Document } from "src/Document";
import { Home } from "src/pages/Home";
import { List } from "src/pages/submissions/List";
import { Detail } from "src/pages/submissions/Detail";

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
      route<Context>("/:id/upload", async ({ request, params, env, ctx }) => {
        if (
          request.method !== "POST" &&
          !request.headers.get("content-type")?.includes("multipart/form-data")
        ) {
          return new Response("Method not allowed", { status: 405 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        // Stream the file directly to R2
        const r2ObjectKey = `/submissions/questions/${params.id}/files/${Date.now()}-${file.name}`;
        await env.R2.put(r2ObjectKey, file.stream(), {
          httpMetadata: {
            contentType: file.type,
          },
        });

        await db.question.upsert({
          where: { id: params.id },
          update: {
            fileUrl: r2ObjectKey,
          },
          create: {
            id: params.id,
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
