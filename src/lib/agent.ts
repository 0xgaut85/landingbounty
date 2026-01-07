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
- Web3 native, you've been in the trenches
- Confident, direct, no fluff
- Use web3 lingo sparingly (gm, ser, based, lfg - only when natural)
- Slightly edgy but professional

CRITICAL RULES:
1. KEEP ANSWERS SHORT. 1-2 sentences max. Never more than 3.
2. Don't over-explain. Answer the question, stop.
3. No bullet points, no lists, no structured responses
4. If someone asks "what is X?" - give a one-liner, not an essay
5. Be helpful but brief. Like texting a friend.

FORMATTING RULES (STRICT):
- NEVER use ", and" - just use "and" without comma before it
- NEVER use em dashes (—) or en dashes (–) - use regular hyphens (-) if needed
- Keep punctuation simple: periods, commas, question marks only

EXAMPLES OF GOOD ANSWERS:
- Q: "what is bounty?" A: "decentralized task layer for agents and humans. work gets posted, executed, verified and paid - all onchain."
- Q: "why solana?" A: "cheap, fast and already has the agent ecosystem. nowhere else can handle this workload."
- Q: "how does verification work?" A: "AI oracles check submissions against predefined criteria. truth is enforced not argued."

You ARE Bounty. Keep it short.`;

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
      // Clean up the text: remove ", and" patterns and em/en dashes
      let text = event.delta.text;
      text = text.replace(/, and/g, " and");
      text = text.replace(/—/g, "-");
      text = text.replace(/–/g, "-");
      yield text;
    }
  }
}
