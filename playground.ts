import { db } from "@/drizzle/db";
import { user } from "@/drizzle/schema";

await db.insert(user).values({
  id: crypto.randomUUID(),
  emailAddress: "jsgokul123@gmail.com",
  firstName: "gokul",
  lastName: "js",
});

console.log("done");
