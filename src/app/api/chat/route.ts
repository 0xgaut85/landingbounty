import { NextRequest } from "next/server";
import { streamChat, ChatMessage } from "@/lib/agent";
import { initializeKnowledge } from "@/lib/knowledge";

let knowledgeInitialized = false;

export async function POST(request: NextRequest) {
  try {
    // Initialize knowledge base once
    if (!knowledgeInitialized) {
      await initializeKnowledge();
      knowledgeInitialized = true;
    }

    const { messages } = await request.json() as { messages: ChatMessage[] };

    if (!messages?.length) {
      return Response.json({ error: "Messages required" }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamChat(messages)) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (error) {
          console.error("Stream error:", error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
