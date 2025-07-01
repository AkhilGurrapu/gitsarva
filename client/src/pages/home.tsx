import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import AppHeader from "@/components/AppHeader";
import CompactTutorialSidebar from "@/components/CompactTutorialSidebar";
import TerminalPanel from "@/components/TerminalPanel";
import InteractiveGitVisualization from "@/components/InteractiveGitVisualization";
import ExplanationPanel from "@/components/ExplanationPanel";
import InstructionModal from "@/components/InstructionModal";
import InteractiveCommandHelper from "@/components/InteractiveCommandHelper";
import IntroWalkthrough from "@/components/IntroWalkthrough";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useGitEngine } from "@/lib/gitEngine";
import { Lightbulb } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const { getRepositoryState, executeCommand } = useGitEngine();
  const [lastCommand, setLastCommand] = useState<string>("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showIntroWalkthrough, setShowIntroWalkthrough] = useState(false);
  const [tutorialCollapsed, setTutorialCollapsed] = useState(false);
  
  // Show walkthrough for first-time users
  useEffect(() => {
    const hasSeenWalkthrough = localStorage.getItem('git-playground-walkthrough-seen');
    if (!hasSeenWalkthrough && isAuthenticated && !isLoading) {
      setShowIntroWalkthrough(true);
    }
  }, [isAuthenticated, isLoading]);

  const repositoryState = getRepositoryState();
  const [showExplanationPanel, setShowExplanationPanel] = useState(false);

  // Show welcome instructions for new users
  useEffect(() => {
    if (isAuthenticated && !repositoryState.initialized) {
      setShowInstructions(true);
    }
  }, [isAuthenticated, repositoryState.initialized]);

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
    setShowInstructions(true);
    // Start with the first command for lesson 1
    if (lessonId === 1) {
      setTimeout(() => {
        setShowInstructions(false);
        setLastCommand('git init'); // This will suggest the command in terminal
      }, 2000);
    }
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
          <div className="absolute left-0 top-16 bottom-0 w-80 bg-github-bg dark:bg-background border-r border-border" onClick={(e) => e.stopPropagation()}>
            <CompactTutorialSidebar 
              onStartWalkthrough={() => setShowIntroWalkthrough(true)}
              onStartLesson={handleStartLesson}
            />
          </div>
        </div>
      )}

      <div className="flex h-screen pt-16">
        <ResizablePanelGroup direction="horizontal">
          {/* Collapsible Tutorial Sidebar */}
          <ResizablePanel
            defaultSize={tutorialCollapsed ? 5 : 25}
            minSize={5}
            maxSize={40}
            className="hidden lg:block"
          >
            <CompactTutorialSidebar 
              collapsed={tutorialCollapsed}
              onToggleCollapse={() => setTutorialCollapsed(!tutorialCollapsed)}
              onStartWalkthrough={() => setShowIntroWalkthrough(true)}
              onStartLesson={handleStartLesson}
            />
          </ResizablePanel>
          
          {!tutorialCollapsed && <ResizableHandle withHandle />}
          
          {/* Main Content Area - Resizable Panels */}
          <ResizablePanel defaultSize={tutorialCollapsed ? 95 : 75} minSize={60}>
            <ResizablePanelGroup direction="horizontal">
              {/* Left Panel: Terminal & Command Helper */}
              <ResizablePanel defaultSize={50} minSize={30}>
                <ResizablePanelGroup direction="vertical">
                  {/* Terminal Panel */}
                  <ResizablePanel defaultSize={60} minSize={30}>
                    <div className="h-full bg-white dark:bg-card">
                      <TerminalPanel 
                        onCommandExecuted={setLastCommand}
                        suggestedCommand={lastCommand}
                      />
                    </div>
                  </ResizablePanel>
                  
                  <ResizableHandle withHandle />
                  
                  {/* Command Helper Panel */}
                  <ResizablePanel defaultSize={40} minSize={20}>
                    <div className="h-full border-t border-border">
                      <InteractiveCommandHelper
                        repositoryState={repositoryState}
                        onSuggestCommand={handleCommandSuggestion}
                        lastCommand={lastCommand}
                      />
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              {/* Right Panel: Git Visualization with floating explanation button */}
              <ResizablePanel defaultSize={50} minSize={30}>
                <div className="h-full bg-github-bg dark:bg-background p-4 relative">
                  <InteractiveGitVisualization 
                    repositoryState={repositoryState}
                    onCommandSuggestion={handleCommandSuggestion}
                  />
                  
                  {/* Floating explanation button */}
                  <button
                    onClick={() => setShowExplanationPanel(true)}
                    className="absolute top-6 right-6 bg-github-blue hover:bg-github-blue/90 text-white p-3 rounded-full shadow-lg transition-colors z-10"
                    title="Learn & Understand"
                  >
                    <Lightbulb className="h-5 w-5" />
                  </button>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <InstructionModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        title="Welcome to Git Playground!"
        content="Let's start your Git journey. Git is a powerful tool for tracking changes in your code. Think of it as a time machine for your projects!"
        steps={[
          "First, we'll initialize a Git repository with 'git init'",
          "Then we'll add some files to track with 'git add'",
          "Finally, we'll save our first snapshot with 'git commit'",
          "You'll see everything visualized in real-time!"
        ]}
        onNext={() => handleCommandSuggestion('git init')}
      />

      <IntroWalkthrough
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
    </div>
  );
}
