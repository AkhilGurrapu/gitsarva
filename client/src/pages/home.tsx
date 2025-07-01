import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/AppHeader";
import TutorialSidebar from "@/components/TutorialSidebar";
import TerminalPanel from "@/components/TerminalPanel";
import InteractiveGitVisualization from "@/components/InteractiveGitVisualization";
import ExplanationPanel from "@/components/ExplanationPanel";
import InstructionModal from "@/components/InstructionModal";
import InteractiveCommandHelper from "@/components/InteractiveCommandHelper";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useGitEngine } from "@/lib/gitEngine";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const { getRepositoryState, executeCommand } = useGitEngine();
  const [lastCommand, setLastCommand] = useState<string>("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const repositoryState = getRepositoryState();

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

  const handleCommandSuggestion = async (command: string) => {
    setLastCommand(command);
    // We can trigger the command execution or just highlight it in the terminal
    try {
      await executeCommand(command);
    } catch (error) {
      console.error("Failed to execute suggested command:", error);
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
      <AppHeader onToggleMobileSidebar={() => setShowMobileSidebar(!showMobileSidebar)} />
      {/* Mobile Tutorial Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileSidebar(false)}>
          <div className="absolute left-0 top-16 bottom-0 w-80 bg-github-bg dark:bg-background border-r border-border" onClick={(e) => e.stopPropagation()}>
            <TutorialSidebar />
          </div>
        </div>
      )}

      <div className="flex h-screen pt-16">
        {/* Desktop Tutorial Sidebar */}
        <div className="hidden lg:block">
          <TutorialSidebar />
        </div>
        
        {/* Main Content Area - Responsive Grid */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-0">
          {/* Left Column: Terminal + Command Helper */}
          <div className="flex flex-col min-h-0 border-r-0 lg:border-r border-border">
            {/* Terminal Panel */}
            <div className="flex-1 border-b border-border">
              <TerminalPanel 
                onCommandExecuted={setLastCommand}
              />
            </div>
            
            {/* Command Helper Panel */}
            <div className="flex-1">
              <InteractiveCommandHelper
                repositoryState={repositoryState}
                onSuggestCommand={handleCommandSuggestion}
                lastCommand={lastCommand}
              />
            </div>
          </div>
          
          {/* Right Column: Git Visualization + Explanations */}
          <div className="flex flex-col min-h-0">
            {/* Git Visualization */}
            <div className="flex-1 border-b border-border">
              <InteractiveGitVisualization 
                repositoryState={repositoryState}
                onCommandSuggestion={handleCommandSuggestion}
              />
            </div>
            
            {/* Explanation Panel */}
            <div className="flex-1">
              <ExplanationPanel 
                currentCommand={lastCommand}
                repositoryState={repositoryState}
              />
            </div>
          </div>
        </main>
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
    </div>
  );
}
