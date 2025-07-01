# Git Playground - replit.md

## Overview

Git Playground is a progressive web app (PWA) designed to teach Git and GitHub through interactive tutorials, visual sandbox environments, and hands-on challenges. The application provides a browser-first learning experience with offline capabilities, featuring a modern full-stack architecture with React frontend and Express backend.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for component-based UI development
- **Vite** for fast development builds and hot module replacement
- **Tailwind CSS** with shadcn/ui components for consistent design system
- **Tanstack Query** for server state management and API caching
- **Wouter** for lightweight client-side routing
- **Service Worker** support for offline functionality and PWA capabilities

### Backend Architecture  
- **Express.js** server with TypeScript for REST API endpoints
- **PostgreSQL** database with Neon serverless hosting
- **Drizzle ORM** for type-safe database operations and migrations
- **Replit Authentication** integration with OpenID Connect
- **Session management** using PostgreSQL store with express-session

### Git Engine
- **Client-side Git simulation** using a custom Git engine for educational purposes
- **Browser-based file system** simulation for repository operations
- **Interactive terminal** with xterm.js for Git command execution
- **Visual Git tree** representation using D3.js concepts

## Key Components

### Authentication System
- Replit OAuth integration with mandatory user operations
- Session-based authentication with PostgreSQL session storage
- Protected routes requiring authentication for core functionality

### Database Schema
- **Users table**: Stores user profile information from Replit OAuth
- **Lessons table**: Contains tutorial content and ordering
- **User Progress table**: Tracks lesson completion and scores
- **User Achievements table**: Gamification system for learning milestones
- **Git Repositories table**: Stores user's practice repository states
- **Sessions table**: Required for Replit Auth session management

### UI Components
- **App Header**: User profile, progress tracking, theme toggle
- **Tutorial Sidebar**: Lesson navigation and progress indicators
- **Terminal Panel**: Interactive Git command interface
- **Visualization Panel**: Git tree and repository state display
- **Instruction Modals**: Step-by-step tutorial guidance

### Git Learning Engine
- Mock Git operations for safe learning environment
- File system simulation with staged/unstaged changes
- Branch management and visualization
- Commit history tracking and display

## Data Flow

1. **Authentication Flow**: User logs in via Replit OAuth → Session created → User data stored/retrieved
2. **Learning Flow**: User selects lesson → Instructions displayed → Commands executed in terminal → Progress tracked
3. **Repository State**: Git commands update mock repository → Visualization updates → State persisted to database
4. **Progress Tracking**: Lesson completion → Achievement unlocks → Progress saved to database

## External Dependencies

### Required Services
- **Neon PostgreSQL**: Serverless database hosting with connection pooling
- **Replit Authentication**: OAuth provider for user authentication

### Optional Enhancements
- **Supabase**: Alternative backend for extended features (mentioned in goals but not implemented)
- **Google One-Tap**: Enhanced authentication options
- **Cloud storage**: For sharing repositories between users

### Key Libraries
- **@neondatabase/serverless**: PostgreSQL connection with WebSocket support
- **drizzle-orm**: Type-safe ORM with migration support  
- **@radix-ui/***: Accessible UI component primitives
- **@tanstack/react-query**: Async state management
- **xterm.js**: Terminal emulator for command interface
- **lucide-react**: Icon library for consistent iconography

## Deployment Strategy

### Development Environment
- **Vite dev server** with HMR for frontend development
- **tsx** for running TypeScript server directly
- **Replit integration** with development banners and error overlays

### Production Build
- **Vite build** for frontend static assets
- **esbuild** for server bundling with ESM output
- **Static file serving** from Express server
- **Database migrations** via Drizzle Kit

### Environment Configuration
- `DATABASE_URL`: Required PostgreSQL connection string
- `SESSION_SECRET`: Required for session security
- `REPL_ID`: Required for Replit authentication
- `ISSUER_URL`: OAuth issuer configuration

## Changelog

```
Changelog:
- July 01, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```