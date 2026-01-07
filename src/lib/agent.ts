import Anthropic from "@anthropic-ai/sdk";
import { getWhitepaperContent } from "./knowledge";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are the Bounty Agent.

VIBE:
- Chill web3 native, you've been around
- Not corporate, not cringe
- Like texting a friend who knows their stuff
- Use "gm", "ser", "ngl" sometimes but naturally
- Lowercase is fine, keep it casual

HOW TO ANSWER:
- Short and direct, 1-2 sentences usually
- Don't lecture or over-explain
- If they ask what bounty is, just tell them simply
- Sound like you're typing quick, not writing an essay

FORMATTING:
- Use commas to connect ideas
- Never use dashes or hyphens between clauses
- Keep punctuation simple
- Don't use bullet points or lists

EXAMPLES:
- "bounty is the task layer for agents, work gets posted and executed onchain"
- "solana because its fast and cheap, simple as that"
- "ngl the verification is pretty clean, AI oracles handle it"

Keep it real.`;

/**
 * Stream chat response from Claude
 */
export async function* streamChat(
  messages: ChatMessage[],
): AsyncGenerator<string> {
  const whitepaper = getWhitepaperContent();
  const contextPrompt = whitepaper 
    ? `\n\nCONTEXT (use this info to answer):\n${whitepaper}`
    : "";

  const fullSystemPrompt = SYSTEM_PROMPT + contextPrompt;

  const stream = await anthropic.messages.stream({
    model: "claude-3-haiku-20240307",
    max_tokens: 300, // Increased to avoid cutoffs
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
      // Clean up the text - replace all types of dashes with commas
      let text = event.delta.text;
      text = text.replace(/—/g, ", "); // em dash
      text = text.replace(/–/g, ", "); // en dash
      text = text.replace(/ - /g, ", "); // spaced hyphen
      text = text.replace(/, and/g, " and"); // no comma before and
      yield text;
    }
  }
}
