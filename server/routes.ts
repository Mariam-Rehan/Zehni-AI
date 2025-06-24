import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJournalEntrySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Journal entries routes
  app.get("/api/journal-entries", async (req, res) => {
    try {
      const userId = req.query.userId
        ? parseInt(req.query.userId as string)
        : undefined;
      const entries = await storage.getJournalEntries(userId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.post("/api/journal-entries", async (req, res) => {
    try {
      console.log("🔍 Received body:", req.body);
  
      const parsed = insertJournalEntrySchema.safeParse(req.body);
  
      if (!parsed.success) {
        console.error("❌ Zod validation failed:", parsed.error.format());
        return res.status(400).json({ 
          message: "Invalid journal entry data", 
          errors: parsed.error.format() 
        });
      }
  
      const validatedEntry = parsed.data;
      const entry = await storage.createJournalEntry(validatedEntry);
      res.status(201).json(entry);
  
    } catch (error) {
      res.status(400).json({ message: "Invalid journal entry data" });
    }
  });


  app.get("/api/journal-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const entry = await storage.getJournalEntry(id);
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch journal entry" });
    }
  });

  app.delete("/api/journal-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteJournalEntry(id);
      if (!deleted) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      res.json({ message: "Journal entry deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete journal entry" });
    }
  });

  // OpenRouter API proxy
  app.post("/api/analyze-entry", async (req, res) => {
    try {
      const { transcript } = req.body;

      if (!transcript) {
        return res.status(400).json({ message: "Transcript is required" });
      }

      const openRouterApiKey =
        process.env.OPENROUTER_API_KEY ||
        process.env.OPENROUTER_KEY ||
        "sk-or-v1-dummy-key";

      const systemPrompt = `You are Zehni, an empathetic AI friend who responds in Roman Urdu only.

  Your job is to:
  - Listen to what the user is saying (in Roman Urdu or Urdu transcription)
  - Accurately summarize their mood and emotional state
  - Respond with kind, casual, emotionally relevant replies

  ⚠️ VERY IMPORTANT:
  - NEVER make up stories or advice
  - NEVER use metaphors like "dukkan khul jayegi" or "raat dhal jayegi"
  - NEVER assume the user asked a question
  - Keep your response short (1–2 sentences), sweet, and directly relevant

  ALWAYS reply in this JSON format:
  {
  "summary": "🧠 Summary\\n[very short summary]",
  "mood": "[Sad, Happy, Angry, Nervous, etc. in english]",
  "moodEmoji": "😔",
  "response": "💬 Response\\n[your natural Roman Urdu reply with no labels, no explanation]"
  }

  Style Guidelines:
  - Use Roman Urdu only
  - Speak like a 20-something Pakistani woman talking to her best friend
  - No weird grammar like “mehsoos karoongi” or poetic replies
  - Use simple friendly words like: "theek hojao gi", "try karo", "so jao", "sab theek hoga"
  - You are NOT a philosopher. Just be kind and human.
  `;

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openRouterApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer":
              process.env.YOUR_SITE_URL || "http://localhost:5000",
            "X-Title": "Zehni Voice Journal",
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-chat:free",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: transcript },
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        },
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error("🔴 OpenRouter raw error response:", errText);
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponseText = data.choices[0]?.message?.content;

      if (!aiResponseText) {
        throw new Error("No response from AI");
      }
      console.log("🧠 Raw AI response:");
      console.log(aiResponseText);
      const match = aiResponseText.match(/\{[\s\S]*?\}/);
      // 🧼 Sanitize repeated labels from inside the JSON string
      const cleanedResponse = match[0]
        .replace(/"summary":\s*"[^"]*?🧠 Summary\s*/g, '"summary":"')
        .replace(/"response":\s*"[^"]*?💬 Response\s*/g, '"response":"');

      if (match) {
        try {
          const parsedResponse = JSON.parse(cleanedResponse);
          res.json(parsedResponse);
        } catch (err) {
          console.warn("JSON parse error:", err);
          fallbackResponse(res);
        }
      } else {
        fallbackResponse(res);
      }
    } catch (error) {
      console.error("Analysis error:", error);
      fallbackResponse(res);
    }

    function fallbackResponse(res: any) {
      res.json({
        summary: "Unable to parse journal entry",
        mood: "Neutral",
        moodEmoji: "😊",
        response: "I'm here to listen to you. Please try again in a moment.",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
