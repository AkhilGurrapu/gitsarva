import {
  users,
  lessons,
  userProgress,
  userAchievements,
  gitRepositories,
  type User,
  type UpsertUser,
  type Lesson,
  type InsertLesson,
  type UserProgress,
  type InsertUserProgress,
  type UserAchievement,
  type InsertUserAchievement,
  type GitRepository,
  type InsertGitRepository,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Lesson operations
  getAllLessons(): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  
  // User progress operations
  getUserProgress(userId: string): Promise<UserProgress[]>;
  getUserProgressForLesson(userId: string, lessonId: number): Promise<UserProgress | undefined>;
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  
  // Achievement operations
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  addUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement>;
  
  // Git repository operations
  getUserRepositories(userId: string): Promise<GitRepository[]>;
  getRepository(id: number): Promise<GitRepository | undefined>;
  createRepository(repository: InsertGitRepository): Promise<GitRepository>;
  updateRepository(id: number, state: any): Promise<GitRepository>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Lesson operations
  async getAllLessons(): Promise<Lesson[]> {
    return await db.select().from(lessons).orderBy(lessons.order);
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson;
  }

  async createLesson(lessonData: InsertLesson): Promise<Lesson> {
    const [lesson] = await db.insert(lessons).values(lessonData).returning();
    return lesson;
  }

  // User progress operations
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
  }

  async getUserProgressForLesson(userId: string, lessonId: number): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.lessonId, lessonId)));
    return progress;
  }

  async updateUserProgress(progressData: InsertUserProgress): Promise<UserProgress> {
    const [progress] = await db
      .insert(userProgress)
      .values(progressData)
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.lessonId],
        set: {
          completed: progressData.completed,
          completedAt: progressData.completedAt,
        },
      })
      .returning();
    return progress;
  }

  // Achievement operations
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.unlockedAt));
  }

  async addUserAchievement(achievementData: InsertUserAchievement): Promise<UserAchievement> {
    const [achievement] = await db
      .insert(userAchievements)
      .values(achievementData)
      .returning();
    return achievement;
  }

  // Git repository operations
  async getUserRepositories(userId: string): Promise<GitRepository[]> {
    return await db
      .select()
      .from(gitRepositories)
      .where(eq(gitRepositories.userId, userId))
      .orderBy(desc(gitRepositories.updatedAt));
  }

  async getRepository(id: number): Promise<GitRepository | undefined> {
    const [repository] = await db
      .select()
      .from(gitRepositories)
      .where(eq(gitRepositories.id, id));
    return repository;
  }

  async createRepository(repositoryData: InsertGitRepository): Promise<GitRepository> {
    const [repository] = await db
      .insert(gitRepositories)
      .values(repositoryData)
      .returning();
    return repository;
  }

  async updateRepository(id: number, state: any): Promise<GitRepository> {
    const [repository] = await db
      .update(gitRepositories)
      .set({ state, updatedAt: new Date() })
      .where(eq(gitRepositories.id, id))
      .returning();
    return repository;
  }
}

export const storage = new DatabaseStorage();
