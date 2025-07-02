import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for user authentication sessions
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for GitSarva users
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  order: integer("order").notNull(),
  difficulty: varchar("difficulty").default("beginner"), // beginner, intermediate, advanced
  estimatedMinutes: integer("estimated_minutes").default(10),
  category: varchar("category").default("foundation"), // foundation, practical, advanced
  prerequisites: text("prerequisites"), // JSON array of lesson IDs that should be completed first
  learningObjectives: text("learning_objectives"), // JSON array of what students will learn
  realWorldContext: text("real_world_context"), // How this applies to actual development
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  lessonId: integer("lesson_id").notNull().references(() => lessons.id),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  achievement: varchar("achievement").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

export const gitRepositories = pgTable("git_repositories", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  state: jsonb("state").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
  achievements: many(userAchievements),
  repositories: many(gitRepositories),
}));

export const lessonsRelations = relations(lessons, ({ many }) => ({
  userProgress: many(userProgress),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [userProgress.lessonId],
    references: [lessons.id],
  }),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
}));

export const gitRepositoriesRelations = relations(gitRepositories, ({ one }) => ({
  user: one(users, {
    fields: [gitRepositories.userId],
    references: [users.id],
  }),
}));

// Types and schemas
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;

export type GitRepository = typeof gitRepositories.$inferSelect;
export type InsertGitRepository = typeof gitRepositories.$inferInsert;

export const insertLessonSchema = createInsertSchema(lessons);
export const insertUserProgressSchema = createInsertSchema(userProgress);
export const insertUserAchievementSchema = createInsertSchema(userAchievements);
export const insertGitRepositorySchema = createInsertSchema(gitRepositories);
