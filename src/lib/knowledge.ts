import fs from "fs";
import path from "path";

// In-memory storage for whitepaper content
let whitepaperContent: string = "";
let isInitialized = false;

/**
 * Initialize knowledge base by loading the whitepaper
 */
export async function initializeKnowledge(): Promise<void> {
  if (isInitialized) return;

  try {
    const whitepaperPath = path.join(process.cwd(), "src/data/whitepaper.md");
    whitepaperContent = fs.readFileSync(whitepaperPath, "utf-8");
    isInitialized = true;
    console.log("Knowledge base initialized successfully");
  } catch (error) {
    console.error("Failed to initialize knowledge base:", error);
    isInitialized = true;
    whitepaperContent = "";
  }
}

/**
 * Get the whitepaper content
 */
export function getWhitepaperContent(): string {
  return whitepaperContent;
}
