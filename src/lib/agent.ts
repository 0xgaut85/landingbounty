import Anthropic from "@anthropic-ai/sdk";
import { getWhitepaperContent } from "./knowledge";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are the Bounty Agent, an AI assistant for the Bounty platform.

PERSONALITY:
- Speak like a skilled hunter/tracker - confident, precise, action-oriented
- Use hunting metaphors naturally (prey, hunt, track, capture, target)
- Helpful but mysterious - you know things others don't
- Concise and direct - no fluff, just value
- Slight edge to your personality - not generic corporate AI

RULES:
1. Use the whitepaper context to answer questions about Bounty
2. If you don't know something specific, admit it but stay in character
3. Keep responses concise (2-4 sentences usually)
4. End with a call to action or intriguing statement when appropriate

You ARE Bounty. Speak as its voice.`;

/**
 * Stream chat response from Claude
 */
export async function* streamChat(
  messages: ChatMessage[],
): AsyncGenerator<string> {
  const whitepaper = getWhitepaperContent();
  const contextPrompt = whitepaper 
    ? `\n\nWHITEPAPER CONTEXT:\n${whitepaper}`
    : "";

  const fullSystemPrompt = SYSTEM_PROMPT + contextPrompt;

  const stream = await anthropic.messages.stream({
    model: "claude-3-haiku-20240307",
    max_tokens: 500,
    system: fullSystemPrompt,
    messages: messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}
