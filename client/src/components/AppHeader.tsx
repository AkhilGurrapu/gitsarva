import { useState } from "react";
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

interface AppHeaderProps {
  onToggleMobileSidebar?: () => void;
  onStartWalkthrough?: () => void;
}

export default function AppHeader({ onToggleMobileSidebar, onStartWalkthrough }: AppHeaderProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const { data: progress = [] } = useQuery({
    queryKey: ['/api/progress'],
    enabled: !!user,
  });

  const completedLessons = progress.filter((p: any) => p.completed).length;
  const totalLessons = 10; // This would come from lessons API
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.email) {
      return user.email;
    }
    return "User";
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
              <GitBranch className="h-6 w-6 text-git-red" />
              <h1 className="text-xl font-bold text-github-dark dark:text-foreground">
                Git Playground
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-github-dark dark:text-foreground hover:text-github-blue font-medium">
                Learn
              </a>
              <a href="#" className="text-muted-foreground hover:text-github-blue font-medium">
                Practice
              </a>
              <a href="#" className="text-muted-foreground hover:text-github-blue font-medium">
                Challenges
              </a>
              <a href="#" className="text-muted-foreground hover:text-github-blue font-medium">
                Docs
              </a>
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
                      src={user?.profileImageUrl || undefined} 
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
