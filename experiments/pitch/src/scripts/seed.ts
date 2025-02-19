import { defineScript } from "@redwoodjs/sdk/worker";
import { db, setupDb } from "../db";

export default defineScript(async ({ env }) => {
  setupDb(env);

  await db.$executeRawUnsafe(`\
    DELETE FROM User;
    DELETE FROM sqlite_sequence;
  `);

  await db.user.createMany({
    data: [
      {
        // id: "1",
        email: "dt@pwv.com",
      },
      {
        // id: "2",
        email: "david@pwv.com",
      },
      {
        // id: "3",
        email: "tom@pwv.com",
      },
      {
        // id: "4",
        email: "jen@pwv.com",
      },
    ],
  });

  console.log("🌱 Finished seeding");
});
