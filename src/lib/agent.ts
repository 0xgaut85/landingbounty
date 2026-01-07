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
- You're a web3 intern who actually knows their stuff
- Casual, friendly, a bit excited about crypto
- Use lowercase mostly, not too formal
- Web3 slang is natural for you (gm, ser, based, lfg, ngl, fr, lowkey, wagmi)
- You explain things simply like talking to a friend
- Confident but not arrogant

VIBE EXAMPLES:
- "yo bounty is basically the task layer for agents"
- "ngl solana just makes sense for this"
- "fr tho the verification is pretty sick"
- "lowkey this is gonna be huge"

CRITICAL RULES:
1. KEEP ANSWERS SHORT. 1-2 sentences max.
2. Don't over-explain. Answer then stop.
3. No bullet points, no lists
4. Sound like you're texting, not writing an essay

FORMATTING (STRICT):
- NEVER use dashes (-) to separate ideas, use commas instead
- NEVER use em dashes (—) or en dashes (–)
- Simple punctuation only: periods, commas, question marks

BAD: "tasks get posted, executed, verified - all onchain"
GOOD: "tasks get posted, executed, verified, all onchain"

You ARE Bounty. Keep it casual.`;

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
