import { Configuration, OpenAIApi, ResponseTypes } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export async function getEmbeddings(text: string) {
  try {
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: text.replace(/\n/g, " "),
    });

    const result = await response.json();
    console.log(
      "OpenAI API Response:",
      JSON.stringify(result).slice(0, 200) + "...",
    );

    // Validate response
    if (
      !result.data ||
      !Array.isArray(result.data) ||
      result.data.length === 0
    ) {
      console.error("Invalid embedding response format:", result);
      throw new Error("Invalid embedding response format: missing data array");
    }

    if (!result.data[0].embedding) {
      console.error("No embedding found in response:", result.data[0]);
      throw new Error("No embedding found in response");
    }

    return result.data[0].embedding as number[];
  } catch (error) {
    console.error("Error calling OpenAI embeddings API:", error);

    // Return a fallback empty embedding vector (1536 dimensions)
    // This allows the application to continue without crashing
    console.log("Returning fallback empty embedding vector");
    return new Array(1536).fill(0);
  }
}
