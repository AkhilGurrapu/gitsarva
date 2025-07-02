import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./supabaseAuth";
import { insertLessonSchema, insertUserProgressSchema, insertUserAchievementSchema, insertGitRepositorySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Lesson routes
  app.get('/api/lessons', async (req, res) => {
    try {
      const lessons = await storage.getAllLessons();
      res.json(lessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });

  app.get('/api/lessons/:id', async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      res.json(lesson);
    } catch (error) {
      console.error("Error fetching lesson:", error);
      res.status(500).json({ message: "Failed to fetch lesson" });
    }
  });

  app.post('/api/lessons', isAuthenticated, async (req, res) => {
    try {
      const lessonData = insertLessonSchema.parse(req.body);
      const lesson = await storage.createLesson(lessonData);
      res.status(201).json(lesson);
    } catch (error) {
      console.error("Error creating lesson:", error);
      res.status(500).json({ message: "Failed to create lesson" });
    }
  });

  // User progress routes
  app.get('/api/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.post('/api/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const progressData = insertUserProgressSchema.parse({
        ...req.body,
        userId,
      });
      const progress = await storage.updateUserProgress(progressData);
      res.json(progress);
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Achievement routes
  app.get('/api/achievements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.post('/api/achievements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const achievementData = insertUserAchievementSchema.parse({
        ...req.body,
        userId,
      });
      const achievement = await storage.addUserAchievement(achievementData);
      res.json(achievement);
    } catch (error) {
      console.error("Error adding achievement:", error);
      res.status(500).json({ message: "Failed to add achievement" });
    }
  });

  // Git repository routes
  app.get('/api/repositories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const repositories = await storage.getUserRepositories(userId);
      res.json(repositories);
    } catch (error) {
      console.error("Error fetching repositories:", error);
      res.status(500).json({ message: "Failed to fetch repositories" });
    }
  });

  app.post('/api/repositories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const repositoryData = insertGitRepositorySchema.parse({
        ...req.body,
        userId,
      });
      const repository = await storage.createRepository(repositoryData);
      res.json(repository);
    } catch (error) {
      console.error("Error creating repository:", error);
      res.status(500).json({ message: "Failed to create repository" });
    }
  });

  app.put('/api/repositories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const repositoryId = parseInt(req.params.id);
      const { state } = req.body;
      const repository = await storage.updateRepository(repositoryId, state);
      res.json(repository);
    } catch (error) {
      console.error("Error updating repository:", error);
      res.status(500).json({ message: "Failed to update repository" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
