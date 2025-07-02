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
  // User operations for GitSarva authentication
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
  // User operations for GitSarva authentication
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

// Seed initial lessons if none exist
async function seedLessons() {
  try {
    const existingLessons = await storage.getAllLessons();
    if (existingLessons.length === 0) {
      const initialLessons = [
        {
          title: "Why Version Control Exists",
          description: "Understand the fundamental problems version control solves in software development",
          content: "Before version control, developers faced chaos: lost work, conflicting changes, no history of who changed what or when. Imagine working on a group project where everyone emails files back and forth - version control solves this nightmare. In this GitSarva sandbox, you'll learn the same concepts professionals use daily, but in a safe browser environment before installing Git on your machine.",
          order: 1,
          difficulty: "beginner",
          estimatedMinutes: 8,
          category: "foundation",
          prerequisites: "[]",
          learningObjectives: JSON.stringify(["Understand why version control was created", "Recognize problems without version control", "See GitSarva as a safe learning environment"]),
          realWorldContext: "Every professional developer works with version control daily. Understanding the 'why' before the 'how' makes all Git concepts much clearer.",
        },
        {
          title: "Git vs GitHub: Understanding the Ecosystem",
          description: "Learn the crucial difference between Git (the tool) and GitHub (the platform)",
          content: "Git is the version control software that runs on your computer. GitHub is a cloud platform that hosts Git repositories and adds collaboration features. Think of Git as Microsoft Word (the software) and GitHub as Google Drive (the cloud storage). Most developers install Git locally and push their code to GitHub. In GitSarva, we simulate this entire workflow in your browser.",
          order: 2,
          difficulty: "beginner",
          estimatedMinutes: 10,
          category: "foundation",
          prerequisites: "[1]",
          learningObjectives: JSON.stringify(["Distinguish between Git and GitHub", "Understand local vs remote repositories", "See how GitSarva simulates both environments"]),
          realWorldContext: "This distinction is crucial for new developers. Many think Git and GitHub are the same thing. Understanding the difference helps you make better decisions about tools and workflows.",
        },
        {
          title: "Real-World Git Installation & Setup",
          description: "Learn how Git is actually installed and configured in professional development",
          content: "In the real world, you'd install Git from git-scm.com, configure your name/email with 'git config', and authenticate with GitHub using SSH keys or tokens. GitSarva replicates this entire environment in your browser, so you can learn without installation. Once you're comfortable here, installing the real Git will feel familiar because the commands and concepts are identical.",
          order: 3,
          difficulty: "beginner",
          estimatedMinutes: 12,
          category: "foundation",
          prerequisites: "[1, 2]",
          learningObjectives: JSON.stringify(["Learn the Git installation process", "Understand initial configuration requirements", "See how GitSarva eliminates setup complexity"]),
          realWorldContext: "Installation and configuration are the first hurdles new developers face. Knowing what's involved helps you transition from GitSarva to real Git seamlessly.",
        },
        {
          title: "The Git Repository: Your Project's Time Machine",
          description: "Understand what a repository is and how it tracks your project's entire history",
          content: "A Git repository is a special folder that tracks every change to your project files. It's like a detailed diary that remembers every version of every file, who changed what, and when. When you 'git init', you're telling Git to start watching this folder. The hidden .git folder stores all this history - never delete it! In real development, each project gets its own repository.",
          order: 4,
          difficulty: "beginner",
          estimatedMinutes: 15,
          category: "practical",
          prerequisites: "[1, 2, 3]",
          learningObjectives: JSON.stringify(["Understand the repository concept", "Learn what 'git init' actually does", "Recognize the importance of the .git folder"]),
          realWorldContext: "Every project you work on professionally will be a Git repository. Understanding what happens when you 'git init' demystifies the entire Git workflow.",
        },
        {
          title: "The Three Areas: Working, Staging, Repository",
          description: "Master Git's three-area workflow that powers all Git operations",
          content: "Git has three areas: Working Directory (your current files), Staging Area (changes ready to save), and Repository (saved snapshots called commits). Think of it like preparing a meal: Working Directory is your ingredients, Staging Area is your prepared dishes, Repository is your cookbook of completed recipes. This three-step process gives you precise control over what gets saved.",
          order: 5,
          difficulty: "intermediate",
          estimatedMinutes: 20,
          category: "practical",
          prerequisites: "[1, 2, 3, 4]",
          learningObjectives: JSON.stringify(["Master the three-area concept", "Practice moving files between areas", "Understand why staging area exists"]),
          realWorldContext: "This three-area workflow is what makes Git powerful and precise. Professional developers use this to craft perfect commits that tell the story of their changes.",
        },
        {
          title: "Your First Commit: Creating Project Snapshots",
          description: "Learn to create commits - the fundamental unit of Git's version control",
          content: "A commit is a snapshot of your project at a moment in time, with a message describing what changed. It's like saving a game - you can always return to this exact state. Every commit has a unique ID (hash) and connects to previous commits, forming a chain of your project's history. Professional developers make small, focused commits with clear messages like 'Add user authentication' or 'Fix login bug'.",
          order: 6,
          difficulty: "intermediate",
          estimatedMinutes: 18,
          category: "practical",
          prerequisites: "[1, 2, 3, 4, 5]",
          learningObjectives: JSON.stringify(["Create meaningful commits", "Write professional commit messages", "Understand commit history"]),
          realWorldContext: "Commits are the building blocks of professional development. Good commit practices make code reviews easier and project history more useful.",
        },
        {
          title: "Git Status: Your Development Compass",
          description: "Master the most important Git command for understanding your project's current state",
          content: "'git status' is your GPS in Git - it shows exactly where you are and what's happening. It tells you which files are modified, staged, or untracked. Professional developers run 'git status' constantly - it's like checking your mirrors while driving. This command prevents mistakes and keeps you oriented in your development workflow.",
          order: 7,
          difficulty: "beginner",
          estimatedMinutes: 12,
          category: "practical",
          prerequisites: "[1, 2, 3, 4, 5, 6]",
          learningObjectives: JSON.stringify(["Master git status output", "Use status to guide workflow", "Develop status-checking habits"]),
          realWorldContext: "Professional developers check git status dozens of times per day. It's the most frequently used Git command and prevents countless mistakes.",
        },
        {
          title: "Branches: Parallel Development Universes",
          description: "Understand how branches enable safe experimentation and feature development",
          content: "Branches are parallel versions of your project where you can experiment safely. The main branch (usually 'main' or 'master') contains stable code, while feature branches contain new work. It's like having multiple drafts of an essay - you can try different approaches without ruining the original. Professional teams use branches for every feature, bug fix, and experiment.",
          order: 8,
          difficulty: "intermediate",
          estimatedMinutes: 25,
          category: "practical",
          prerequisites: "[1, 2, 3, 4, 5, 6, 7]",
          learningObjectives: JSON.stringify(["Create and switch branches", "Understand branch isolation", "Practice safe experimentation"]),
          realWorldContext: "Branching is what makes Git shine in team environments. Every professional team uses feature branches to develop new functionality safely.",
        },
        {
          title: "Merging: Combining Parallel Work",
          description: "Learn how Git combines changes from different branches back together",
          content: "Merging takes changes from one branch and incorporates them into another. When you merge a feature branch into main, you're saying 'this work is ready and tested'. Git intelligently combines changes, but sometimes conflicts occur when the same lines were modified differently. In real development, merging often happens through Pull Requests on GitHub, adding code review to the process.",
          order: 9,
          difficulty: "intermediate",
          estimatedMinutes: 22,
          category: "practical",
          prerequisites: "[1, 2, 3, 4, 5, 6, 7, 8]",
          learningObjectives: JSON.stringify(["Master branch merging", "Handle merge conflicts", "Understand Pull Request workflow"]),
          realWorldContext: "Merging is how teams integrate new features. Understanding merging (and conflicts) is essential for collaborative development.",
        },
        {
          title: "Remote Repositories: Connecting to GitHub",
          description: "Understand how local Git repositories connect to GitHub for collaboration",
          content: "Remote repositories are versions of your project hosted on platforms like GitHub. They enable collaboration and backup. When you 'push', you send your local commits to GitHub. When you 'pull', you download others' changes. This is how teams work together - everyone has a local copy and shares changes through GitHub. GitSarva simulates this workflow without needing actual GitHub setup.",
          order: 10,
          difficulty: "intermediate",
          estimatedMinutes: 20,
          category: "practical",
          prerequisites: "[1, 2, 3, 4, 5, 6, 7, 8, 9]",
          learningObjectives: JSON.stringify(["Understand remote repositories", "Practice push/pull simulation", "Connect local and remote concepts"]),
          realWorldContext: "Every professional project uses remote repositories for collaboration, backup, and deployment. This is where individual work becomes team work.",
        },
        {
          title: "Professional Git Workflow",
          description: "See how all Git concepts work together in real development teams",
          content: "Professional development follows patterns: create branch for feature, make commits as you work, push to GitHub, create Pull Request for review, merge when approved. This workflow ensures quality, enables collaboration, and maintains project stability. GitSarva teaches you this exact workflow - the commands and concepts you learn here are identical to what professional developers use daily.",
          order: 11,
          difficulty: "advanced",
          estimatedMinutes: 30,
          category: "advanced",
          prerequisites: "[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]",
          learningObjectives: JSON.stringify(["Master complete Git workflow", "Simulate professional development", "Integrate all learned concepts"]),
          realWorldContext: "This is how professional software development actually works. Mastering this workflow makes you immediately productive on any development team.",
        },
        {
          title: "GitSarva vs Real Git: Making the Transition",
          description: "Understand exactly how your GitSarva knowledge applies to real-world development",
          content: "Everything you learn in GitSarva applies directly to real Git. The commands are identical, the concepts are the same, and the workflow matches professional practice. The only difference is GitSarva runs in your browser while real Git runs on your computer. When you're ready to install Git, you'll find the transition seamless because you already understand the fundamental concepts and commands.",
          order: 12,
          difficulty: "beginner",
          estimatedMinutes: 15,
          category: "foundation",
          prerequisites: "[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]",
          learningObjectives: JSON.stringify(["Plan transition to real Git", "Compare GitSarva to real environment", "Build confidence for next steps"]),
          realWorldContext: "This lesson prepares you for installing and using real Git with confidence. You'll know exactly what to expect and how to get started.",
        }
      ];

      for (const lesson of initialLessons) {
        await storage.createLesson(lesson);
      }
      console.log("Seeded initial lessons");
    }
  } catch (error) {
    console.error("Failed to seed lessons:", error);
  }
}

// Call seed function
seedLessons();
