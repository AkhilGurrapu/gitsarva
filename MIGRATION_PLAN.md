# GitSarva Migration Plan: Replit → Local → Supabase

## 🎯 Application Overview

**GitSarva** is a browser-first Git Playground PWA that teaches Git/GitHub through:
- Interactive terminal with Git command simulation
- Real-time Git tree visualization  
- Structured tutorial system with progress tracking
- Achievement system and gamification
- Safe sandbox environment for Git practice

## 📊 Current Status

✅ **COMPLETED**: Local Development Setup
- Dependencies installed successfully
- Development server running on http://localhost:5000
- Frontend and backend are operational
- GitSarva branding added to header

## 🚧 Migration Phases

### Phase 1: ✅ Local Development Foundation (COMPLETED)

**Status**: ✅ Done
- [x] Dependencies installed (`npm install`)
- [x] Development server running (`npm run dev`)
- [x] GitSarva branding added to header
- [x] Application accessible at http://localhost:5000

### Phase 2: 🚀 Direct Supabase Setup (RECOMMENDED)

**New Approach**: Skip local PostgreSQL and go directly to Supabase

#### 2.1 Supabase Project Creation
1. Create account at [supabase.com](https://supabase.com)
2. Create new project named "GitSarva"
3. Get Database URL from Settings → Database
4. Get API credentials from Settings → API

#### 2.2 Quick Setup Options

**Option A: Automated Setup Script**
```bash
./supabase-setup.sh
```

**Option B: Manual Setup**
```bash
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
export SUPABASE_URL="https://[PROJECT].supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
export SESSION_SECRET="your-session-secret"
export NODE_ENV="development"
```

#### 2.2 Database Schema Migration
```bash
# Run database migrations
npm run db:push
```

#### 2.3 Required Environment Variables
Create these environment variables manually (since .env files are restricted):

```bash
# Database
export DATABASE_URL="postgresql://postgres:password@localhost:5432/gitsarva"

# Session Management
export SESSION_SECRET="your-super-secret-session-key-change-this"

# Development
export NODE_ENV="development"

# Temporary Auth (will be replaced in Phase 3)
export REPLIT_DOMAINS="localhost:5000"
export ISSUER_URL="https://replit.com/oidc"
export REPL_ID="temp-for-migration"
```

### Phase 3: 🔄 Authentication Migration

**Current**: Replit OAuth
**Target**: Supabase Auth or simplified local auth

#### 3.1 Remove Replit Dependencies
- [ ] Remove Replit-specific auth code in `server/replitAuth.ts`
- [ ] Update authentication middleware
- [ ] Modify session management

#### 3.2 Implement Local Authentication (Temporary)
- [ ] Create simple email/password auth
- [ ] Update user management
- [ ] Modify protected routes

#### 3.3 Prepare for Supabase Integration
- [ ] Install Supabase client libraries
- [ ] Configure Supabase project
- [ ] Update authentication flow

### Phase 4: 🔮 Supabase Cloud Migration

#### 4.1 Supabase Project Setup
- [ ] Create Supabase project (free tier)
- [ ] Configure database schema
- [ ] Set up authentication providers
- [ ] Configure RLS policies

#### 4.2 Data Migration
- [ ] Export local data
- [ ] Import to Supabase
- [ ] Update connection strings
- [ ] Test data integrity

#### 4.3 Authentication Integration
- [ ] Configure Supabase Auth
- [ ] Implement OAuth providers (Google, GitHub)
- [ ] Update frontend auth components
- [ ] Test authentication flow

#### 4.4 API Migration
- [ ] Replace direct database calls with Supabase client
- [ ] Update real-time subscriptions
- [ ] Configure Edge Functions if needed
- [ ] Test all endpoints

## 🛠️ Technical Requirements

### Dependencies to Add for Supabase
```json
{
  "@supabase/supabase-js": "^2.45.4",
  "@supabase/auth-helpers-react": "^0.5.0",
  "@supabase/auth-helpers-nextjs": "^0.10.0"
}
```

### Environment Variables for Supabase
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## 📋 Files to Modify

### Phase 2 (Database)
- `server/db.ts` - Update connection configuration
- `drizzle.config.ts` - Update for local database
- `shared/schema.ts` - Ensure compatibility

### Phase 3 (Authentication)
- `server/replitAuth.ts` - Replace with new auth system
- `server/routes.ts` - Update auth middleware
- `client/src/hooks/useAuth.ts` - Update auth logic
- `client/src/lib/authUtils.ts` - Update utilities

### Phase 4 (Supabase)
- `server/db.ts` - Replace with Supabase client
- All API routes in `server/routes.ts`
- Frontend auth components
- Database queries and mutations

## 🔍 Current Issues to Address

1. **Database Connection**: Need to configure PostgreSQL locally
2. **Environment Variables**: Cannot create .env files (restriction)
3. **Authentication**: Replit OAuth won't work locally
4. **Session Management**: Depends on database connection

## 🚀 Next Immediate Steps

1. **Create Supabase project** at [supabase.com](https://supabase.com)
2. **Run setup script** `./supabase-setup.sh` OR set environment variables manually
3. **Test database connection** with `npm run db:push`
4. **Start development server** with `npm run dev`
5. **Replace Replit authentication** with Supabase Auth

## 🔧 Local Development Commands

```bash
# Start development server
npm run dev

# Run database migrations
npm run db:push

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run check
```

## 📝 Testing Checklist

### Phase 2 Verification
- [ ] Database connection successful
- [ ] Tables created via migrations
- [ ] Basic API endpoints working
- [ ] User registration/login functional

### Phase 3 Verification  
- [ ] Local authentication working
- [ ] Session management functional
- [ ] Protected routes accessible
- [ ] User data persisting

### Phase 4 Verification
- [ ] Supabase connection established
- [ ] Data migrated successfully
- [ ] Authentication providers working
- [ ] Real-time features functional
- [ ] All API endpoints operational

## 🎯 Success Criteria

- ✅ Local development environment fully functional
- ✅ Database operations working without Replit dependencies
- ✅ Authentication system independent of Replit
- ✅ All features working on Supabase free tier
- ✅ Offline capabilities maintained (PWA features)
- ✅ Performance maintained or improved 