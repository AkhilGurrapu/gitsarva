import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { GitBranch, Sun, Moon, ChevronDown, User, LogOut, Menu, HelpCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";

// Type definitions for our auth system
interface GitSarvaUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
}

interface UserProgress {
  id: number;
  userId: string;
  lessonId: number;
  completed: boolean;
  completedAt: string | null;
}

interface AppHeaderProps {
  onToggleMobileSidebar?: () => void;
  onStartWalkthrough?: () => void;
}

export default function AppHeader({ onToggleMobileSidebar, onStartWalkthrough }: AppHeaderProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [location] = useLocation();
  
  // Type the user as GitSarvaUser
  const typedUser = user as GitSarvaUser | undefined;
  
  const { data: progress = [] } = useQuery<UserProgress[]>({
    queryKey: ['/api/progress'],
    enabled: !!user,
  });

  const completedLessons = progress.filter((p: UserProgress) => p.completed).length;
  const totalLessons = 10; // This would come from lessons API
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserDisplayName = () => {
    if (typedUser?.firstName && typedUser?.lastName) {
      return `${typedUser.firstName} ${typedUser.lastName}`;
    }
    if (typedUser?.firstName) {
      return typedUser.firstName;
    }
    if (typedUser?.email) {
      return typedUser.email;
    }
    return "User";
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getNavLinkClass = (path: string) => {
    return location === path 
      ? "text-github-dark dark:text-foreground hover:text-github-blue font-medium transition-colors duration-200 border-b-2 border-github-blue"
      : "text-muted-foreground hover:text-github-blue font-medium transition-colors duration-200 hover:border-b-2 hover:border-github-blue pb-1";
  };

  return (
    <header className="bg-white dark:bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onToggleMobileSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg overflow-hidden">
                <img 
                  src="/datasarva-logo.jpg" 
                  alt="Datasarva Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-xl font-bold text-github-dark dark:text-foreground">
                GitSarva
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className={getNavLinkClass("/")}>
                Learn
              </Link>
              <Link href="/practice" className={getNavLinkClass("/practice")}>
                Practice
              </Link>
              <Link href="/git-cheat-sheet" className={getNavLinkClass("/git-cheat-sheet")}>
                Git Cheat Sheet
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Progress Indicator */}
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Progress:</span>
              <Progress value={progressPercentage} className="w-20" />
              <span className="text-sm font-medium text-git-green">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            
            {/* Walkthrough Button */}
            {onStartWalkthrough && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onStartWalkthrough}
                className="hidden md:flex"
                title="Take Interface Tour"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            )}
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={typedUser?.profileImageUrl || undefined} 
                      alt={getUserDisplayName()} 
                    />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-github-dark dark:text-foreground hidden sm:block">
                    {getUserDisplayName()}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
