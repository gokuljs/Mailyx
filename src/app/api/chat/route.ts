import { FREE_CREDITS_PER_DAY } from "./../../../lib/Constants";
import { Configuration, OpenAIApi } from "openai-edge";
import { Message, streamText } from "ai";
import { auth } from "@clerk/nextjs/server";
import { getEmbeddings } from "@/lib/embedding";
import { openai as aiProvider } from "@ai-sdk/openai";
import { db } from "@/drizzle/db";
import {
  subscription,
  chatBotInteraction,
  emailEmbedding,
  email as emailTable,
  emailAddress,
} from "@/drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export async function POST(req: Request) {
  const today = new Date().toDateString();
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized access");
    }
    const { accountId, messages } = await req.json();
    if (!accountId) {
      throw new Error("Account Id not found");
    }

    // Check subscription status
    const subInfo = await db
      .select({
        status: subscription.status,
        endedAt: subscription.endedAt,
      })
      .from(subscription)
      .where(eq(subscription.userId, userId))
      .limit(1);

    const currentDate = new Date();
    const endDate = subInfo[0]?.endedAt ? new Date(subInfo[0].endedAt) : null;
    const isSubscribed =
      subInfo[0]?.status === "ACTIVE" && (!endDate || currentDate < endDate);

    if (!isSubscribed) {
      // First check if the user has ANY interactions (to avoid unique constraint)
      const anyUserInteraction = await db
        .select()
        .from(chatBotInteraction)
        .where(eq(chatBotInteraction.userId, userId))
        .limit(1);

      if (anyUserInteraction.length === 0) {
        // User has no interactions yet, create a new record
        await db.insert(chatBotInteraction).values({
          id: crypto.randomUUID(),
          userId,
          day: today,
          count: 1,
        });
      } else {
        // User already has interactions, check for today
        const todayInteraction = await db
          .select()
          .from(chatBotInteraction)
          .where(
            and(
              eq(chatBotInteraction.userId, userId),
              eq(chatBotInteraction.day, today),
            ),
          )
          .limit(1);

        if (todayInteraction.length === 0) {
          // User has interactions but not for today
          await db
            .update(chatBotInteraction)
            .set({
              day: today,
              count: 1,
            })
            .where(eq(chatBotInteraction.userId, userId));
        } else if (
          todayInteraction.length > 0 &&
          todayInteraction[0] &&
          todayInteraction[0].count >= FREE_CREDITS_PER_DAY
        ) {
          return new Response(
            "You have reached the daily limit of free credits",
            {
              status: 429,
            },
          );
        }
      }
    }

    // Get query embedding
    const lastMessage = messages.at(-1);
    const queryEmbedding = await getEmbeddings(lastMessage.content);

    // Format embedding for PostgreSQL vector type
    const embeddingString = `[${queryEmbedding.join(",")}]`;

    // Use Supabase vector search through drizzle
    const searchResults = await db.execute(sql`
      SELECT 
        e.id, 
        e.subject, 
        e.body, 
        e."sentAt" as sentAt, 
        ea.address as fromEmail, 
        ea.name as fromName,
        eb.content,
        eb."accountEmail" as accountEmail,
        eb.embedding <-> ${embeddingString}::vector as similarity
      FROM "EmailEmbedding" eb
      JOIN "Email" e ON eb."emailId" = e.id
      JOIN "EmailAddress" ea ON e."fromId" = ea.id
      WHERE eb."accountId" = ${accountId}
        AND eb.embedding <-> ${embeddingString}::vector < 0.8
      ORDER BY similarity ASC
      LIMIT 25
    `);

    console.log(searchResults.length, "results found");
    if (searchResults.length > 0) {
      console.log(
        "Similarity scores:",
        searchResults.map((r) => r.similarity),
      );
    }

    const context = {
      hits: searchResults.map((result) => ({
        document: {
          subject: result.subject,
          body: result.body,
          from: {
            name: result.fromname,
            email: result.fromemail,
          },
          content: result.content,
          accountEmail: result.accountemail,
          similarity: result.similarity,
        },
      })),
    };

    const systemPrompt = `
        You are an AI email assistant embedded in an email client app. Your purpose is to help the user compose emails by answering questions, providing suggestions, and offering relevant information based on the context of their previous emails.
        THE TIME NOW IS ${new Date().toLocaleString()}
        START CONTEXT BLOCK
        ${context.hits.map((hit) => JSON.stringify(hit.document)).join("\n")}
        END OF CONTEXT BLOCK
        When responding, please keep in mind:
        - Be helpful, clever, and articulate.
        - Rely on the provided email context to inform your responses.
        - If the context does not contain enough information to answer a question, politely say you don't have enough information.
        - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
        - Do not invent or speculate about anything that is not directly supported by the email context.
        - Keep your responses concise and relevant to the user's questions or the email being composed.
  `;

    const allMessages = [
      { role: "system", content: systemPrompt },
      ...messages, // UIMessage[] from useChat
    ];

    const result = streamText({
      model: aiProvider("gpt-4.1-mini"),
      messages: allMessages,
      onFinish: async (response) => {
        // Update interaction count - get the latest to avoid race conditions
        const existingInteraction = await db
          .select()
          .from(chatBotInteraction)
          .where(eq(chatBotInteraction.userId, userId))
          .limit(1);

        if (existingInteraction.length > 0 && existingInteraction[0]) {
          await db
            .update(chatBotInteraction)
            .set({
              day: today,
              count: existingInteraction[0].count + 1,
            })
            .where(eq(chatBotInteraction.userId, userId));
        }
      },
    });

    // 2) return a pre‑built StreamingTextResponse
    return result.toDataStreamResponse({
      status: 200,
    });
  } catch (e) {
    console.log(e);
    return new Response("Error", { status: 500 });
  }
}
