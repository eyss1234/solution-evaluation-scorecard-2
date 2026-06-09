const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";

/** Thrown when the OpenAI API key is missing from the environment. */
export class OpenAIConfigError extends Error {
  constructor(message = "OPEN_AI_KEY is not configured") {
    super(message);
    this.name = "OpenAIConfigError";
  }
}

interface ChatCompletionParams {
  system: string;
  user: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Call the OpenAI chat completions API and return the generated text.
 *
 * Reads the API key from `OPEN_AI_KEY`. Throws {@link OpenAIConfigError} when it
 * is missing, and a plain `Error` for transport or upstream API failures.
 */
export async function generateChatCompletion({
  system,
  user,
  model = DEFAULT_MODEL,
  temperature = 0.7,
  maxTokens = 600,
}: ChatCompletionParams): Promise<string> {
  const apiKey = process.env.OPEN_AI_KEY;
  if (!apiKey) {
    throw new OpenAIConfigError();
  }

  const response = await fetch(OPENAI_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) {
    // Drain the body so the connection can be reused, but keep it out of the
    // thrown message — it can contain account/quota detail we don't want in logs.
    await response.text().catch(() => "");
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;

  if (typeof content !== "string") {
    throw new Error("OpenAI returned an unexpected response shape");
  }

  return content.trim();
}
