import { db } from "@/server/db";

await db.user.create({
  data: {
    emailAddress: "jsgokul123@gmail.com",
    firstName: "gokul",
    lastName: "js",
  },
});

console.log("done");
