import { Configuration, OpenAIApi } from "openai-edge";
import { Message, streamText } from "ai";
import { auth } from "@clerk/nextjs/server";
import { OramaClient } from "@/lib/orama";
import { openai as aiProvider } from "@ai-sdk/openai";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized access");
    }
    const { accountId, messages } = await req.json();
    if (!accountId) {
      throw new Error("Account Id not found");
    }
    const orama = new OramaClient(accountId);
    await orama.init();
    const lastMessage = messages.at(-1);
    const context = await orama.vectorSearch({
      term: lastMessage.content,
    });
    console.log(context.hits.length, "hits found");
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
