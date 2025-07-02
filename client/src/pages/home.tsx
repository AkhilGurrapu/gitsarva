import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import AppHeader from "@/components/AppHeader";
import CompactTutorialSidebar from "@/components/CompactTutorialSidebar";
import TerminalPanel from "@/components/TerminalPanel";
import InteractiveGitVisualization from "@/components/InteractiveGitVisualization";
import ExplanationPanel from "@/components/ExplanationPanel";
import InteractiveCommandHelper from "@/components/InteractiveCommandHelper";
import InteractiveOverlayWalkthrough from "@/components/InteractiveOverlayWalkthrough";
import LessonModal from "@/components/LessonModal";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useGitEngine } from "@/lib/gitEngine";
import { Lightbulb } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";

interface Lesson {
  id: number;
  title: string;
  description: string;
  content: string;
  difficulty?: string;
  estimatedMinutes?: number;
  category?: string;
  learningObjectives?: string;
  realWorldContext?: string;
}

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const { getRepositoryState, executeCommand } = useGitEngine();
  const [lastCommand, setLastCommand] = useState<string>("");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showIntroWalkthrough, setShowIntroWalkthrough] = useState(false);
  const [tutorialCollapsed, setTutorialCollapsed] = useState(false);
  const [currentLessonId, setCurrentLessonId] = useState<number | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  
  // Fetch lessons data
  const { data: lessons = [] } = useQuery<Lesson[]>({
    queryKey: ['/api/lessons'],
  });
  
  // Show walkthrough for first-time users
  useEffect(() => {
    const hasSeenWalkthrough = localStorage.getItem('gitsarva-walkthrough-seen');
    if (!hasSeenWalkthrough && isAuthenticated && !isLoading) {
      setShowIntroWalkthrough(true);
    }
  }, [isAuthenticated, isLoading]);

  const repositoryState = getRepositoryState();
  const [showExplanationPanel, setShowExplanationPanel] = useState(false);

  // Disable the welcome instructions popup - users can learn through the interactive walkthrough instead
  // useEffect(() => {
  //   if (isAuthenticated && !repositoryState.initialized) {
  //     setShowInstructions(true);
  //   }
  // }, [isAuthenticated, repositoryState.initialized]);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const handleCommandSuggestion = (command: string) => {
    setLastCommand(command);
    // This will suggest the command in terminal for user to execute manually
  };

  const handleStartLesson = (lessonId: number) => {
    setCurrentLessonId(lessonId);
    setShowLessonModal(true);
  };

  const handleLessonCommand = (command: string) => {
    setLastCommand(command);
    // Focus the terminal after suggesting a command
    setTimeout(() => {
      const terminalInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (terminalInput) {
        terminalInput.focus();
      }
    }, 100);
  };

  const handleCloseLessonModal = () => {
    setShowLessonModal(false);
    setCurrentLessonId(null);
  };

  const getCurrentLesson = (): Lesson | null => {
    if (!currentLessonId || !lessons.length) return null;
    return lessons.find(lesson => lesson.id === currentLessonId) || null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-github-bg dark:bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-github-blue"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-github-bg dark:bg-background">
      <AppHeader 
        onToggleMobileSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
        onStartWalkthrough={() => setShowIntroWalkthrough(true)}
      />
      {/* Mobile Tutorial Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileSidebar(false)}>
          <div className="absolute left-0 top-16 bottom-0 w-4/5 max-w-sm bg-github-bg dark:bg-background border-r border-border transition-transform duration-300" onClick={(e) => e.stopPropagation()}>
            <CompactTutorialSidebar 
              onStartWalkthrough={() => setShowIntroWalkthrough(true)}
              onStartLesson={handleStartLesson}
            />
          </div>
        </div>
      )}

      <div className="flex h-screen pt-16 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="w-full h-full">
          {/* Tutorial Sidebar - Always present as ResizablePanel */}
          <ResizablePanel
            defaultSize={tutorialCollapsed ? 3 : 25}
            minSize={tutorialCollapsed ? 3 : 20}
            maxSize={tutorialCollapsed ? 3 : 40}
            className="hidden lg:block transition-all duration-300"
            data-walkthrough="tutorial-sidebar"
          >
            <CompactTutorialSidebar 
              collapsed={tutorialCollapsed}
              onToggleCollapse={() => setTutorialCollapsed(!tutorialCollapsed)}
              onStartWalkthrough={() => setShowIntroWalkthrough(true)}
              onStartLesson={handleStartLesson}
            />
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Main Content Area - Resizable Panels */}
          <ResizablePanel 
            defaultSize={tutorialCollapsed ? 97 : 75} 
            minSize={50}
            className="flex-1"
          >
            <ResizablePanelGroup direction="horizontal" className="w-full h-full min-w-0">
              {/* Left Panel: Terminal & Command Helper */}
              <ResizablePanel 
                defaultSize={42} 
                minSize={35}
                maxSize={60}
                className="min-w-0"
              >
                <div className="h-full p-1 sm:p-2 lg:p-3 overflow-hidden">
                  <ResizablePanelGroup direction="vertical" className="h-full min-h-0">
                    {/* Terminal Panel */}
                    <ResizablePanel 
                      defaultSize={60} 
                      minSize={30}
                      maxSize={80}
                      className="min-w-0"
                      data-walkthrough="terminal-panel"
                    >
                      <div className="h-full bg-white dark:bg-card overflow-hidden">
                        <TerminalPanel 
                          onCommandExecuted={setLastCommand}
                          suggestedCommand={lastCommand}
                        />
                      </div>
                    </ResizablePanel>
                    
                    <ResizableHandle withHandle />
                    
                    {/* Command Helper Panel */}
                    <ResizablePanel 
                      defaultSize={40} 
                      minSize={20}
                      maxSize={70}
                      className="min-w-0"
                      data-walkthrough="command-helper"
                    >
                      <div className="h-full border-t border-border overflow-hidden">
                        <InteractiveCommandHelper
                          repositoryState={repositoryState}
                          onSuggestCommand={handleCommandSuggestion}
                          lastCommand={lastCommand}
                        />
                      </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </div>
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              {/* Right Panel: Git Visualization with floating explanation button */}
              <ResizablePanel 
                defaultSize={58} 
                minSize={40}
                maxSize={65}
                className="min-w-0"
                data-walkthrough="git-visualization"
              >
                <div className="h-full bg-github-bg dark:bg-background p-1 sm:p-2 lg:p-3 relative overflow-hidden">
                  <InteractiveGitVisualization 
                    repositoryState={repositoryState}
                    onCommandSuggestion={handleCommandSuggestion}
                  />
                  
                  {/* Floating explanation button */}
                  <button
                    onClick={() => setShowExplanationPanel(true)}
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 lg:top-6 lg:right-6 bg-github-blue hover:bg-github-blue/90 text-white p-2 sm:p-3 rounded-full shadow-lg transition-colors z-10"
                    title="Learn & Understand"
                  >
                    <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Removed the welcome popup - users learn through the interactive walkthrough instead */}

      <InteractiveOverlayWalkthrough
        isOpen={showIntroWalkthrough}
        onClose={() => setShowIntroWalkthrough(false)}
      />

      {/* Explanation Panel as Popup */}
      <Dialog open={showExplanationPanel} onOpenChange={setShowExplanationPanel}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-github-blue" />
              <span>Learn & Understand</span>
            </DialogTitle>
          </DialogHeader>
          <ExplanationPanel 
            currentCommand={lastCommand}
            repositoryState={repositoryState}
          />
        </DialogContent>
      </Dialog>

      {/* Lesson Modal */}
      <LessonModal
        isOpen={showLessonModal}
        onClose={handleCloseLessonModal}
        lesson={getCurrentLesson()}
        onSuggestCommand={handleLessonCommand}
      />
    </div>
  );
}
