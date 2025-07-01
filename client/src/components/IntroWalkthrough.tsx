import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Terminal, 
  GitBranch, 
  BookOpen, 
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  X,
  Play
} from "lucide-react";

interface IntroWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WalkthroughStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  features: string[];
  tips: string[];
}

const walkthroughSteps: WalkthroughStep[] = [
  {
    id: 1,
    title: "Interactive Terminal",
    description: "Your command center for learning Git. Execute real Git commands and see instant feedback.",
    icon: Terminal,
    features: [
      "Real-time command execution",
      "Command history with arrow keys",
      "Auto-suggestions and completion",
      "Color-coded output for better understanding"
    ],
    tips: [
      "Use ↑/↓ arrow keys to navigate command history",
      "Press Tab for command suggestions",
      "Commands are executed in a safe sandbox environment"
    ]
  },
  {
    id: 2,
    title: "Smart Command Helper",
    description: "Get contextual suggestions based on your current Git repository state and learning progress.",
    icon: Lightbulb,
    features: [
      "Context-aware command suggestions",
      "Step-by-step guidance",
      "Categorized by difficulty level",
      "Interactive command insertion"
    ],
    tips: [
      "Click any suggested command to auto-fill the terminal",
      "Commands are ranked by relevance to your current situation",
      "Green suggestions are beginner-friendly"
    ]
  },
  {
    id: 3,
    title: "Visual Git Tree",
    description: "See your Git history come alive with interactive branch diagrams and commit visualization.",
    icon: GitBranch,
    features: [
      "Real-time branch visualization",
      "Interactive commit nodes",
      "File status indicators",
      "Drag-and-drop interactions"
    ],
    tips: [
      "Hover over commits to see detailed information",
      "Different colors represent different file states",
      "Click on branches to see their history"
    ]
  },
  {
    id: 4,
    title: "Learning Hub",
    description: "Your structured path through Git mastery with lessons, progress tracking, and achievements.",
    icon: BookOpen,
    features: [
      "Progressive lesson structure",
      "Progress tracking and achievements",
      "Collapsible for focused learning",
      "Quick tips and shortcuts"
    ],
    tips: [
      "Collapse this panel when you want to focus on practicing",
      "Track your progress across multiple learning sessions",
      "Each lesson builds on previous concepts"
    ]
  }
];

export default function IntroWalkthrough({ isOpen, onClose }: IntroWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < walkthroughSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    onClose();
  };

  const step = walkthroughSteps[currentStep];
  const Icon = step.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Icon className="h-5 w-5 text-github-blue" />
              <span>Welcome to Git Playground</span>
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2">
            {walkthroughSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-8 rounded-full transition-colors ${
                  index === currentStep
                    ? "bg-github-blue"
                    : index < currentStep
                    ? "bg-success-green"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Main Content */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-github-blue/10 rounded-full mb-4">
                  <Icon className="h-8 w-8 text-github-blue" />
                </div>
                <h2 className="text-xl font-semibold text-github-dark dark:text-foreground mb-2">
                  {step.title}
                </h2>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h3 className="font-medium text-github-dark dark:text-foreground mb-3">
                  Key Features:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {step.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-github-blue rounded-full" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <h3 className="font-medium text-github-dark dark:text-foreground mb-2 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2 text-yellow-600" />
                  Pro Tips:
                </h3>
                <ul className="space-y-1">
                  {step.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start">
                      <span className="mr-2">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} of {walkthroughSteps.length}
              </span>
            </div>

            {currentStep === walkthroughSteps.length - 1 ? (
              <Button onClick={handleFinish} className="flex items-center space-x-2">
                <Play className="h-4 w-4" />
                <span>Start Learning</span>
              </Button>
            ) : (
              <Button onClick={handleNext} className="flex items-center space-x-2">
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}