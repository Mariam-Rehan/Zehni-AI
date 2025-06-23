import { users, journalEntries, type User, type InsertUser, type JournalEntry, type InsertJournalEntry } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Journal entry methods
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntries(userId?: number): Promise<JournalEntry[]>;
  getJournalEntry(id: number): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const [entry] = await db
      .insert(journalEntries)
      .values(insertEntry)
      .returning();
    return entry;
  }

  async getJournalEntries(userId?: number): Promise<JournalEntry[]> {
    if (userId) {
      return await db.select().from(journalEntries).where(eq(journalEntries.userId, userId)).orderBy(journalEntries.createdAt);
    }
    return await db.select().from(journalEntries).orderBy(journalEntries.createdAt);
  }

  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    return entry || undefined;
  }

  async deleteJournalEntry(id: number): Promise<boolean> {
    const result = await db.delete(journalEntries).where(eq(journalEntries.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private journalEntries: Map<number, JournalEntry>;
  private currentUserId: number;
  private currentEntryId: number;

  constructor() {
    this.users = new Map();
    this.journalEntries = new Map();
    this.currentUserId = 1;
    this.currentEntryId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const id = this.currentEntryId++;
    const entry: JournalEntry = {
      id,
      userId: insertEntry.userId ?? null,
      transcript: insertEntry.transcript,
      audioUrl: insertEntry.audioUrl ?? null,
      mood: insertEntry.mood,
      moodEmoji: insertEntry.moodEmoji,
      summary: insertEntry.summary,
      aiResponse: insertEntry.aiResponse,
      createdAt: new Date(),
      duration: insertEntry.duration ?? null,
    };
    this.journalEntries.set(id, entry);
    return entry;
  }

  async getJournalEntries(userId?: number): Promise<JournalEntry[]> {
    const entries = Array.from(this.journalEntries.values());
    if (userId) {
      return entries.filter(entry => entry.userId === userId);
    }
    return entries.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(id);
  }

  async deleteJournalEntry(id: number): Promise<boolean> {
    return this.journalEntries.delete(id);
  }
}

export const storage = new DatabaseStorage();
