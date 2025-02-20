import { defineApp } from "@redwoodjs/sdk/worker";
import { index, layout, prefix, route } from "@redwoodjs/sdk/router";
import { Document } from "src/Document";
import { Home } from "src/pages/Home";
import { List } from "src/pages/portfolio/List";
import { setupDb } from "./db";
import { Detail } from "src/pages/portfolio/Detail";

type Context = {
  id: string;
};

export default defineApp<Context>([
  async ({ ctx, env, request }) => {
    await setupDb(env);
  },
  layout(Document, [
    index([Home]),
    route("/hello", function () {
      return new Response("Hello, world!");
    }),
    prefix("/portfolio", [route("/", List), route("/:id", Detail)]),
  ]),
]);
