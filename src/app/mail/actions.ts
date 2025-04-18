"use server";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";

export async function generateEmail(context: string, prompt: string) {
  const stream = createStreamableValue();
  (async () => {
    const { textStream } = await streamText({
      model: openai("gpt-4.1-mini"),
      prompt: `
      You are an AI email assistant embedded in an email client app. Your purpose is to help the user compose emails by providing suggestions and relevant information based on the context of their previous emails.
      
      THE TIME NOW IS ${new Date().toLocaleString()}
      
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      
      USER PROMPT:
      ${prompt}
      
      When responding, please keep in mind:
      - Be helpful, clever, and articulate. 
      - Rely on the provided email context to inform your response.
      - If the context does not contain enough information to fully address the prompt, politely give a draft response.
      - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
      - Do not invent or speculate about anything that is not directly supported by the email context.
      - Keep your response focused and relevant to the user's prompt.
      - Don't add fluff like 'Heres your email' or 'Here's your email' or anything like that.
      - Directly output the email, no need to say 'Here is your email' or anything like that.
      - No need to output subject
      `,
    });

    for await (const token of textStream) {
      stream.update(token);
    }

    stream.done();
  })();

  return {
    output: stream?.value,
  };
}

export async function generate(input: string) {
  console.log({ input }, "ssssf");
  const stream = createStreamableValue();
  (async () => {
    const { textStream } = await streamText({
      model: openai("gpt-4.1-mini"),
      temperature: 0,
      prompt: `
        You are a helpful AI embedded in an email client app that autocompletes sentences, similar to Gmail's autocomplete feature.

        Your task is to predict and provide the most natural continuation for the user's partial text. Keep these guidelines in mind:

        1. Continue the text in the same tone, style, and voice as the input
        2. Provide only the direct continuation - no additional paragraphs, explanations, or commentary
        3. Keep completions concise and grammatically correct
        4. Focus on completing just the current sentence or thought
        5. Output only plain text without formatting, markdown, or HTML
        6. Your output will be directly concatenated to the input text

        The user's partial text is provided between <input> tags: <input>${input}</input>

        Do not include phrases like "I'm here to help" or identify yourself as an AI in your responses.

        Example:
        Input: "Dear Alice, I'm sorry to hear that you are feeling down."
        Output: "I hope things improve for you soon and wanted to check if there's anything I can do to help."

        Example:
        Input: "Hey Ajo, my order has not"
        Output: "been delivered yet. Could you please provide an update on the shipping status?"
      `,
    });

    for await (const token of textStream) {
      stream.update(token);
    }

    stream.done();
  })();

  return {
    output: stream?.value,
  };
}
