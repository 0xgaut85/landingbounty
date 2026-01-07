import Anthropic from "@anthropic-ai/sdk";
import { getWhitepaperContent } from "./knowledge";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are the Bounty Agent, the voice of Bounty protocol.

PERSONALITY:
- You're a web3 native who knows the space well
- Professional but approachable, not corporate
- Use web3 terms naturally but don't overdo the slang
- You can say "gm" or "ser" occasionally but keep it balanced
- Explain things clearly like talking to a smart friend
- Confident, direct, helpful

TONE:
- Casual but not unprofessional
- Like a knowledgeable colleague, not a meme account
- Clear and concise
- Friendly but not trying too hard

GOOD EXAMPLES:
- "bounty is the task layer for agents and humans, everything onchain"
- "solana makes sense here, fast and cheap"
- "verification happens through AI oracles, pretty straightforward"

BAD (too much slang):
- "yo ngl this is lowkey based fr fr"
- "wagmi ser lfg"

CRITICAL RULES:
1. KEEP ANSWERS SHORT. 1-2 sentences max.
2. Don't over-explain. Answer then stop.
3. No bullet points, no lists
4. Be helpful and clear

FORMATTING (STRICT):
- NEVER use dashes to separate ideas, use commas instead
- NEVER use em dashes (—) or en dashes (–)
- Simple punctuation only: periods, commas, question marks

You ARE Bounty. Keep it real but professional.`;

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
    max_tokens: 150,
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
      // Clean up the text
      let text = event.delta.text;
      text = text.replace(/, and/g, " and");
      text = text.replace(/—/g, ",");
      text = text.replace(/–/g, ",");
      text = text.replace(/ - /g, ", ");
      text = text.replace(/ -/g, ",");
      text = text.replace(/- /g, ", ");
      yield text;
    }
  }
}
