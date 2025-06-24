import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  transcript: text("transcript").notNull(),
  audioUrl: text("audio_url", { mode: "nullable" }),
  mood: text("mood").notNull(),
  moodEmoji: text("mood_emoji").notNull(),
  summary: text("summary").notNull(),
  aiResponse: text("ai_response").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  duration: integer("duration", { mode: "nullable" }),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertJournalEntrySchema = z.object({
  userId: z.number().nullable().optional(),
  transcript: z.string().min(1),
  audioUrl: z.string().nullable().optional(),
  mood: z.string().min(1),
  moodEmoji: z.string().min(1),
  summary: z.string().min(1),
  aiResponse: z.string().min(1),
  duration: z.number().nullable().optional(),
});


export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
