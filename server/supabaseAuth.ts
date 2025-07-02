import { createClient } from '@supabase/supabase-js';
import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error("Environment variables SUPABASE_URL and SUPABASE_ANON_KEY must be set");
}

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

// Simple auth setup for development (can be extended with OAuth later)
export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Simple login endpoint for development
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      // For development, create a simple user
      const userId = `user_${email.replace('@', '_').replace('.', '_')}`;
      const user = {
        id: userId,
        email: email,
        firstName: email.split('@')[0],
        lastName: "",
        profileImageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      };

      // Store user in database
      await storage.upsertUser(user);
      
      // Set session
      (req.session as any).user = user;
      
      res.json({ user, message: "Logged in successfully" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Guest login for easy testing
  app.post('/api/auth/guest', async (req, res) => {
    try {
      // Use a unique guest ID every time to avoid conflicts
      const guestId = `guest_${Date.now()}`;
      const guestEmail = `guest_${Date.now()}@gitsarva.com`;
      
      const guestUser = {
        id: guestId,
        email: guestEmail,
        firstName: "Guest",
        lastName: "User",
        profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=guest",
      };

      // Create the unique guest user
      const createdUser = await storage.upsertUser(guestUser);

      // Set session
      (req.session as any).user = createdUser;
      
      res.json({ user: createdUser, message: "Logged in as guest" });
    } catch (error) {
      console.error("Guest login error:", error);
      res.status(500).json({ message: "Guest login failed" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = (req.session as any)?.user;

  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // Attach user to request for use in routes
  (req as any).user = user;
  next();
};

export { supabase }; 