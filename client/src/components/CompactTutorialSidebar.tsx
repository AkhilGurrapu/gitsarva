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
  difficulty?: string;
  estimatedMinutes?: number;
  category?: string;
  prerequisites?: string;
  learningObjectives?: string;
  realWorldContext?: string;
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
  onStartLesson?: (lessonId: number) => void;
}

export default function CompactTutorialSidebar({ 
  collapsed = false, 
  onToggleCollapse,
  onStartWalkthrough,
  onStartLesson
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
        { id: 1, title: "Understand the chaos without version control", completed: false },
        { id: 2, title: "Recognize version control benefits", completed: false },
        { id: 3, title: "See GitSarva as safe learning environment", completed: false }
      ],
      2: [
        { id: 1, title: "Distinguish Git (software) from GitHub (platform)", completed: false },
        { id: 2, title: "Understand the local-remote relationship", completed: false },
        { id: 3, title: "See how GitSarva simulates both", completed: false }
      ],
      3: [
        { id: 1, title: "Learn actual Git installation process", completed: false },
        { id: 2, title: "Understand configuration requirements", completed: false },
        { id: 3, title: "See GitSarva's replication approach", completed: false }
      ],
      4: [
        { id: 1, title: "Understand repository concept", completed: false },
        { id: 2, title: "Run 'git init' command", completed: false },
        { id: 3, title: "Examine the .git folder concept", completed: false }
      ],
      5: [
        { id: 1, title: "Learn the three-area workflow", completed: false },
        { id: 2, title: "Practice moving files between areas", completed: false },
        { id: 3, title: "Master 'git add' command", completed: false }
      ],
      6: [
        { id: 1, title: "Create your first commit", completed: false },
        { id: 2, title: "Write meaningful commit messages", completed: false },
        { id: 3, title: "View commit history with 'git log'", completed: false }
      ],
      7: [
        { id: 1, title: "Run 'git status' frequently", completed: false },
        { id: 2, title: "Interpret status output", completed: false },
        { id: 3, title: "Use status to guide workflow", completed: false }
      ],
      8: [
        { id: 1, title: "Create a new branch", completed: false },
        { id: 2, title: "Switch between branches", completed: false },
        { id: 3, title: "Understand branch isolation", completed: false }
      ],
      9: [
        { id: 1, title: "Merge feature branch to main", completed: false },
        { id: 2, title: "Handle merge conflicts", completed: false },
        { id: 3, title: "Clean up merged branches", completed: false }
      ],
      10: [
        { id: 1, title: "Understand remote concept", completed: false },
        { id: 2, title: "Practice push simulation", completed: false },
        { id: 3, title: "Practice pull simulation", completed: false }
      ],
      11: [
        { id: 1, title: "Follow professional workflow", completed: false },
        { id: 2, title: "Create feature branch workflow", completed: false },
        { id: 3, title: "Simulate pull request process", completed: false }
      ],
      12: [
        { id: 1, title: "Compare GitSarva to real Git", completed: false },
        { id: 2, title: "Plan your Git installation", completed: false },
        { id: 3, title: "Prepare for real-world transition", completed: false }
      ]
    };
    return stepMap[lessonId] || [];
  };

  if (collapsed) {
    return (
      <div className="w-full h-full bg-white dark:bg-card flex flex-col items-center py-2 space-y-2 border-r border-border overflow-hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="p-1.5 h-8 w-8"
          title="Expand Learning Hub"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
        
        <div className="rotate-90 text-[10px] text-muted-foreground whitespace-nowrap origin-center">
          Learn
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onStartWalkthrough}
          className="p-1.5 h-8 w-8"
          title="Take Tour"
        >
          <HelpCircle className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white dark:bg-card border-r border-border overflow-y-auto" data-walkthrough="tutorial-sidebar">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-github-blue" />
            <h2 className="font-semibold text-github-dark dark:text-foreground">
              Git Foundations & Real-World Mastery
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
            <span className="text-muted-foreground">Foundation Progress</span>
            <span className="font-medium text-github-dark dark:text-foreground">
              {completedLessons}/{lessons.length}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {progressPercentage === 100 
              ? "🎓 Ready for real-world Git!" 
              : progressPercentage === 0 
                ? "Start with version control fundamentals"
                : `Building your Git foundation...`
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
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-github-dark dark:text-foreground">
                          {lesson.title}
                        </h3>
                        {lesson.difficulty && (
                          <Badge 
                            variant={
                              lesson.difficulty === 'beginner' ? 'secondary' :
                              lesson.difficulty === 'intermediate' ? 'default' : 'destructive'
                            }
                            className="text-xs px-1.5 py-0.5"
                          >
                            {lesson.difficulty}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {lesson.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {lesson.estimatedMinutes && (
                          <span>⏱️ {lesson.estimatedMinutes} min</span>
                        )}
                        {lesson.category && (
                          <span className="capitalize">📂 {lesson.category}</span>
                        )}
                      </div>
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
                <CardContent className="p-3 pt-0 space-y-3">
                  {/* Learning Objectives */}
                  {lesson.learningObjectives && (
                    <div className="bg-muted/30 p-2 rounded text-xs">
                      <h4 className="font-medium text-github-dark dark:text-foreground mb-1">🎯 You'll Learn:</h4>
                      <ul className="space-y-0.5 text-muted-foreground">
                        {JSON.parse(lesson.learningObjectives).map((objective: string, idx: number) => (
                          <li key={idx}>• {objective}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Real-World Context */}
                  {lesson.realWorldContext && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded text-xs">
                      <h4 className="font-medium text-github-dark dark:text-foreground mb-1">🌍 Real-World Application:</h4>
                      <p className="text-muted-foreground">{lesson.realWorldContext}</p>
                    </div>
                  )}

                  {/* Learning Steps */}
                  <div>
                    <h4 className="font-medium text-github-dark dark:text-foreground mb-2 text-xs">📋 Learning Steps:</h4>
                    {steps.map((step) => (
                      <div key={step.id} className="flex items-center space-x-2 text-xs mb-1">
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
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="w-full mt-3 text-xs" 
                    variant={lessonProgress?.completed ? "outline" : "default"}
                    onClick={() => onStartLesson?.(lesson.id)}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    {lessonProgress?.completed ? "Reinforce Concepts" : "Learn Foundation"}
                  </Button>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Learning Philosophy */}
      <div className="p-4 mt-4 border-t border-border/50">
        <h3 className="text-sm font-medium text-github-dark dark:text-foreground mb-2">
          🎯 Learning Philosophy
        </h3>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>• Concepts before commands</p>
          <p>• Real-world context always</p>
          <p>• GitSarva = Safe practice environment</p>
          <p>• Same commands as professional Git</p>
          <p>• Understanding over memorization</p>
        </div>
      </div>
    </div>
  );
}