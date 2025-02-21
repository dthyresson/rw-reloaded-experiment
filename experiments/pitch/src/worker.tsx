import { defineApp } from "@redwoodjs/sdk/worker";
import { index, layout, prefix, route } from "@redwoodjs/sdk/router";
import { Document } from "src/Document";
import { Home } from "src/pages/Home";
import { List } from "src/pages/submissions/List";
import { Detail } from "src/pages/submissions/Detail";

import { setupDb } from "./db";

type Context = {
  id: string;
};

type RouteContext = {};

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
    ]),
  ]),
]);
