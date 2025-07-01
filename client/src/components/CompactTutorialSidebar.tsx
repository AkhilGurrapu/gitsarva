import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Circle, 
  ChevronRight, 
  ChevronDown,
  BookOpen,
  Play,
  Star,
  ChevronLeft,
  Menu,
  HelpCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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

interface CompactTutorialSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onStartWalkthrough?: () => void;
}

export default function CompactTutorialSidebar({ 
  collapsed = false, 
  onToggleCollapse,
  onStartWalkthrough 
}: CompactTutorialSidebarProps) {
  const [expandedLesson, setExpandedLesson] = useState<number | null>(1);
  
  const { data: lessons = [] } = useQuery<Lesson[]>({
    queryKey: ['/api/lessons'],
  });
  
  const { data: progress = [] } = useQuery<UserProgress[]>({
    queryKey: ['/api/progress'],
  });

  const getProgressForLesson = (lessonId: number) => {
    return progress.find(p => p.lessonId === lessonId);
  };

  const completedLessons = progress.filter(p => p.completed).length;
  const progressPercentage = lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0;

  const getLessonSteps = (lessonId: number) => {
    const stepMap: Record<number, Array<{id: number, title: string, completed: boolean}>> = {
      1: [
        { id: 1, title: "Initialize repository", completed: false },
        { id: 2, title: "Add files", completed: false },
        { id: 3, title: "Make first commit", completed: false },
        { id: 4, title: "Check status", completed: false }
      ],
      2: [
        { id: 1, title: "Create branch", completed: false },
        { id: 2, title: "Switch branches", completed: false },
        { id: 3, title: "Merge changes", completed: false }
      ],
      3: [
        { id: 1, title: "Add remote", completed: false },
        { id: 2, title: "Push changes", completed: false },
        { id: 3, title: "Pull updates", completed: false }
      ]
    };
    return stepMap[lessonId] || [];
  };

  if (collapsed) {
    return (
      <div className="w-12 h-full bg-white dark:bg-card border-r border-border flex flex-col items-center py-4 space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="p-2"
          title="Expand Learning Hub"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <div className="rotate-90 text-xs text-muted-foreground whitespace-nowrap">
          Learn
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onStartWalkthrough}
          className="p-2"
          title="Take Tour"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 h-full bg-white dark:bg-card border-r border-border overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-github-blue" />
            <h2 className="font-semibold text-github-dark dark:text-foreground">
              Git Mastery Path
            </h2>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onStartWalkthrough}
              className="p-1.5"
              title="Take Tour"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="p-1.5"
              title="Collapse Panel"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium text-github-dark dark:text-foreground">
              {completedLessons}/{lessons.length}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {progressPercentage === 100 
              ? "🎉 All lessons completed!" 
              : `${Math.round(progressPercentage)}% complete`
            }
          </p>
        </div>
      </div>

      {/* Lessons */}
      <div className="p-2">
        {lessons.map((lesson) => {
          const lessonProgress = getProgressForLesson(lesson.id);
          const isExpanded = expandedLesson === lesson.id;
          const steps = getLessonSteps(lesson.id);
          
          return (
            <Card key={lesson.id} className="mb-2 overflow-hidden">
              <CardHeader 
                className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {lessonProgress?.completed ? (
                      <CheckCircle className="h-4 w-4 text-success-green" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-github-dark dark:text-foreground">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {lesson.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {lessonProgress?.completed && (
                      <Star className="h-3 w-3 text-yellow-500" />
                    )}
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="p-3 pt-0 space-y-2">
                  {steps.map((step) => (
                    <div key={step.id} className="flex items-center space-x-2 text-xs">
                      {step.completed ? (
                        <CheckCircle className="h-3 w-3 text-success-green" />
                      ) : (
                        <Circle className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className={
                        step.completed 
                          ? "text-muted-foreground line-through" 
                          : "text-github-dark dark:text-foreground"
                      }>
                        {step.title}
                      </span>
                    </div>
                  ))}
                  
                  {lesson.id === 1 && (
                    <Button 
                      size="sm" 
                      className="w-full mt-3 text-xs" 
                      variant={lessonProgress?.completed ? "outline" : "default"}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      {lessonProgress?.completed ? "Review" : "Start Lesson"}
                    </Button>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Quick Tips */}
      <div className="p-4 mt-4 border-t border-border/50">
        <h3 className="text-sm font-medium text-github-dark dark:text-foreground mb-2">
          💡 Quick Tips
        </h3>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>• Use arrow keys to navigate terminal history</p>
          <p>• Click on suggested commands to auto-fill</p>
          <p>• Hover over Git areas to see explanations</p>
        </div>
      </div>
    </div>
  );
}