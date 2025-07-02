import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Lesson {
  id: number;
  title: string;
  description: string;
  order: number;
}

interface UserProgress {
  lessonId: number;
  completed: boolean;
  completedAt?: string;
}

export default function TutorialSidebar() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentLesson, setCurrentLesson] = useState<number>(1);

  const { data: lessons = [] } = useQuery<Lesson[]>({
    queryKey: ['/api/lessons'],
  });

  const { data: progress = [] } = useQuery<UserProgress[]>({
    queryKey: ['/api/progress'],
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (data: { lessonId: number; completed: boolean }) => {
      await apiRequest('POST', '/api/progress', {
        lessonId: data.lessonId,
        completed: data.completed,
        completedAt: data.completed ? new Date().toISOString() : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
      toast({
        title: "Progress Updated",
        description: "Your lesson progress has been saved.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getLessonProgress = (lessonId: number) => {
    return progress.find(p => p.lessonId === lessonId);
  };

  const getCompletedCount = () => {
    return progress.filter(p => p.completed).length;
  };

  const currentStep = 1; // This would be dynamic based on user progress
  
  const getLessonSteps = (lessonId: number) => {
    const lessonProgress = getLessonProgress(lessonId);
    const isCompleted = lessonProgress?.completed;
    
    switch (lessonId) {
      case 1:
        return [
          { id: 1, title: "What is Git?", completed: true },
          { id: 2, title: "Initialize repository", completed: isCompleted },
          { id: 3, title: "Understand the workflow", completed: false },
        ];
      case 2:
        return [
          { id: 1, title: "Understanding staging", completed: false },
          { id: 2, title: "Adding files", completed: false },
          { id: 3, title: "Making commits", completed: false },
        ];
      default:
        return [];
    }
  };

  return (
    <aside className="w-80 bg-white dark:bg-card border-r border-border flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-github-dark dark:text-foreground">
          Git Fundamentals
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Learn version control step by step
        </p>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{getCompletedCount()}/{lessons.length}</span>
          </div>
          <Progress 
            value={lessons.length > 0 ? (getCompletedCount() / lessons.length) * 100 : 0} 
            className="h-2"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {/* Lesson 1: Getting Started */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-github-dark dark:text-foreground">
              1. Getting Started
            </h3>
            <CheckCircle className="h-5 w-5 text-success-green" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Initialize your first repository and understand Git basics
          </p>
          <div className="space-y-2">
            {getLessonSteps(1).map((step) => (
              <div key={step.id} className="flex items-center space-x-2 text-sm">
                {step.completed ? (
                  <CheckCircle className="h-3 w-3 text-success-green" />
                ) : step.id === currentStep ? (
                  <div className="h-3 w-3 border-2 border-github-blue rounded-full" />
                ) : (
                  <Circle className="h-3 w-3 text-muted-foreground" />
                )}
                <span className={
                  step.completed 
                    ? "text-muted-foreground" 
                    : step.id === currentStep 
                      ? "text-github-blue font-medium" 
                      : "text-muted-foreground"
                }>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Lesson 2: Branching & Merging */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-github-dark dark:text-foreground">
              2. Branching & Merging
            </h3>
            <Circle className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Master the power of branches and learn to merge changes
          </p>
          <div className="space-y-2">
            {getLessonSteps(2).map((step) => (
              <div key={step.id} className="flex items-center space-x-2 text-sm">
                {step.completed ? (
                  <CheckCircle className="h-3 w-3 text-success-green" />
                ) : (
                  <Circle className="h-3 w-3 text-muted-foreground" />
                )}
                <span className={step.completed ? "text-muted-foreground" : "text-muted-foreground"}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Lesson 3: Remote Repositories */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-github-dark dark:text-foreground">
              3. Remote Repositories
            </h3>
            <Circle className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Connect with GitHub and collaborate with others
          </p>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Circle className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Adding remotes</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Circle className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Push & pull</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            🎓 Ready to practice what you've learned?
          </p>
          <p className="text-xs text-muted-foreground">
            Use the Practice section to experiment in a safe sandbox environment
          </p>
        </div>
      </div>
    </aside>
  );
}
