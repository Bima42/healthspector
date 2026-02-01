import OpenAI from "openai";
import { z, type ZodType } from "zod";
import { env } from "@/config/env";
import { logLLMRequest } from "./logger";

export async function llmInvoke<T>(
  prompt: string,
  schema: ZodType<T>,
  systemMessage: string,
  model: string = "google/gemini-3-flash-preview"
): Promise<T> {
  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: env.OPENROUTER_API_KEY,
  });

  const jsonSchema = z.toJSONSchema(schema, {
    target: "draft-2020-12",
    unrepresentable: "throw",
  });

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "structured_output",
          strict: true,
          schema: jsonSchema,
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(content);
    const validated = schema.parse(parsed);

    await logLLMRequest(systemMessage, prompt, content, null);

    return validated;
  } catch (error) {
    console.error("[LLM] Error:", error);

    await logLLMRequest(
      systemMessage,
      prompt,
      null,
      error instanceof Error ? error : new Error(String(error))
    );

    throw error;
  }
}