import { useState, useEffect } from "react";
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
  Play,
  SkipForward
} from "lucide-react";

interface InteractiveOverlayWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WalkthroughStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  features: string[];
  action?: string;
}

const walkthroughSteps: WalkthroughStep[] = [
  {
    id: 1,
    title: "Learning Hub",
    description: "Start your Git journey here! This sidebar contains structured lessons, progress tracking, and achievements to guide your learning.",
    icon: BookOpen,
    targetSelector: '[data-walkthrough="tutorial-sidebar"]',
    position: 'right',
    features: [
      "Progressive lesson structure from basics to advanced",
      "Track your learning progress across sessions",
      "Unlock achievements as you master concepts",
      "Collapse this panel to focus on practicing"
    ],
    action: "Click on 'Start Lesson' to begin your first Git lesson"
  },
  {
    id: 2,
    title: "Interactive Terminal",
    description: "Your command center for learning Git! Execute real Git commands here and see instant feedback in a safe sandbox environment.",
    icon: Terminal,
    targetSelector: '[data-walkthrough="terminal-panel"]',
    position: 'top',
    features: [
      "Type Git commands just like in a real terminal",
      "Use ↑/↓ arrow keys to navigate command history",
      "Commands are executed safely in an isolated environment",
      "Get real-time feedback and error messages"
    ],
    action: "Try typing 'git status' to see the current repository state"
  },
  {
    id: 3,
    title: "Visual Git Tree",
    description: "Watch your Git history come alive! This interactive visualization shows commits, branches, and file changes in real-time.",
    icon: GitBranch,
    targetSelector: '[data-walkthrough="git-visualization"]',
    position: 'left',
    features: [
      "See commits and branches as interactive nodes",
      "Different colors represent file states (staged, modified, untracked)",
      "Hover over elements for detailed information",
      "Watch the tree update as you execute commands"
    ],
    action: "After running commands, observe how the visualization updates"
  },
  {
    id: 4,
    title: "Smart Command Helper",
    description: "Get intelligent suggestions! This panel provides contextual command recommendations based on your current Git state and learning progress.",
    icon: Lightbulb,
    targetSelector: '[data-walkthrough="command-helper"]',
    position: 'left',
    features: [
      "Context-aware command suggestions",
      "Click any command to auto-fill the terminal",
      "Commands ranked by relevance and difficulty",
      "Green suggestions are beginner-friendly"
    ],
    action: "Click on any suggested command to automatically fill the terminal"
  }
];

export default function InteractiveOverlayWalkthrough({ isOpen, onClose }: InteractiveOverlayWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [cardPosition, setCardPosition] = useState({ top: 0, left: 0 });

  const step = walkthroughSteps[currentStep];

  // Find target element and calculate position
  useEffect(() => {
    if (!isOpen) return;

    const findTargetElement = () => {
      const element = document.querySelector(step.targetSelector) as HTMLElement;
      if (element) {
        setTargetElement(element);
        
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        // Card dimensions (estimate)
        const cardWidth = 384; // w-96 = 384px
        const cardHeight = 600; // Estimated height
        const padding = 20;
        
        let top = 0;
        let left = 0;
        
        // Calculate initial position
        switch (step.position) {
          case 'top':
            top = rect.top + scrollTop - cardHeight - padding;
            left = rect.left + scrollLeft + rect.width / 2;
            break;
          case 'bottom':
            top = rect.bottom + scrollTop + padding;
            left = rect.left + scrollLeft + rect.width / 2;
            break;
          case 'left':
            top = rect.top + scrollTop + rect.height / 2;
            left = rect.left + scrollLeft - cardWidth - padding;
            break;
          case 'right':
            top = rect.top + scrollTop + rect.height / 2;
            left = rect.right + scrollLeft + padding;
            break;
        }
        
        // Viewport boundary checks and adjustments
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Horizontal boundary checks
        if (left + cardWidth > viewportWidth - padding) {
          left = viewportWidth - cardWidth - padding;
        }
        if (left < padding) {
          left = padding;
        }
        
        // Vertical boundary checks
        if (top + cardHeight > viewportHeight - padding) {
          top = viewportHeight - cardHeight - padding;
        }
        if (top < padding) {
          top = padding;
        }
        
        // For mobile screens, center the card
        if (viewportWidth < 768) {
          left = (viewportWidth - Math.min(cardWidth, viewportWidth - 40)) / 2;
          top = Math.max(padding, (viewportHeight - cardHeight) / 2);
        }
        
        setCardPosition({ top, left });
      }
    };

    // Initial find
    findTargetElement();
    
    // Retry finding element if not found immediately
    const retryInterval = setInterval(() => {
      if (!targetElement) {
        findTargetElement();
      } else {
        clearInterval(retryInterval);
      }
    }, 100);

    // Handle window resize
    const handleResize = () => {
      if (targetElement) {
        findTargetElement();
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      clearInterval(retryInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, step, targetElement]);

  // Scroll target element into view
  useEffect(() => {
    if (targetElement) {
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center', 
        inline: 'center' 
      });
    }
  }, [targetElement]);

  const handleNext = () => {
    if (currentStep < walkthroughSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setTargetElement(null); // Reset to trigger new search
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setTargetElement(null); // Reset to trigger new search
    }
  };

  const handleFinish = () => {
    localStorage.setItem('gitsarva-walkthrough-seen', 'true');
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('gitsarva-walkthrough-seen', 'true');
    onClose();
  };

  if (!isOpen) return null;

  const Icon = step.icon;

  return (
    <>
      {/* Simplified overlay that allows interactions */}
      <div className="fixed inset-0 bg-black/30 z-[100] pointer-events-none" />
      
      {/* Highlight the target element */}
      {targetElement && (
        <div
          className="fixed pointer-events-none z-[101] border-4 border-github-blue rounded-lg shadow-lg transition-all duration-300"
          style={{
            top: targetElement.getBoundingClientRect().top - 4,
            left: targetElement.getBoundingClientRect().left - 4,
            width: targetElement.getBoundingClientRect().width + 8,
            height: targetElement.getBoundingClientRect().height + 8,
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 0 9999px rgba(0, 0, 0, 0.2)',
          }}
        />
      )}

      {/* Walkthrough card */}
      <Card 
        className="fixed z-[103] w-96 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-4rem)] shadow-2xl pointer-events-auto overflow-hidden"
        style={{
          top: `${cardPosition.top}px`,
          left: `${cardPosition.left}px`,
          // Remove complex transforms that can cause positioning issues
        }}
      >
        <CardContent className="p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-github-blue/10 rounded-full">
                <Icon className="h-5 w-5 text-github-blue" />
              </div>
              <div>
                <h3 className="font-semibold text-github-dark dark:text-foreground">
                  {step.title}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  Step {currentStep + 1} of {walkthroughSteps.length}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-sm mb-4">
            {step.description}
          </p>

          {/* Features */}
          <div className="mb-4">
            <h4 className="font-medium text-github-dark dark:text-foreground text-sm mb-2">
              Key Features:
            </h4>
            <ul className="space-y-1">
              {step.features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 bg-github-blue rounded-full mt-1.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action */}
          {step.action && (
            <div className="bg-github-blue/5 border border-github-blue/20 rounded-lg p-3 mb-4">
              <p className="text-xs font-medium text-github-blue">
                💡 Try this: {step.action}
              </p>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="flex justify-center space-x-1 mb-4">
            {walkthroughSteps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-6 rounded-full transition-colors ${
                  index === currentStep
                    ? "bg-github-blue"
                    : index < currentStep
                    ? "bg-success-green"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="text-xs px-3"
            >
              <ChevronLeft className="h-3 w-3 mr-1" />
              Previous
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-xs px-3"
            >
              <SkipForward className="h-3 w-3 mr-1" />
              Skip Tour
            </Button>

            {currentStep === walkthroughSteps.length - 1 ? (
              <Button 
                onClick={handleFinish} 
                size="sm"
                className="text-xs px-3"
              >
                <Play className="h-3 w-3 mr-1" />
                Start Learning
              </Button>
            ) : (
              <Button 
                onClick={handleNext} 
                size="sm"
                className="text-xs px-3"
              >
                Next
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
} 