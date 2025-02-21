import { defineLinks } from "@redwoodjs/sdk/router";

export const link = defineLinks([
  "/",
  "/submissions",
  "/submissions/:id",
  "/submissions/:id/edit",
  "/questions/:id",
  "/questions/:id/upload",
]);
