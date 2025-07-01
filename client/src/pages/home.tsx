import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/AppHeader";
import TutorialSidebar from "@/components/TutorialSidebar";
import TerminalPanel from "@/components/TerminalPanel";
import VisualizationPanel from "@/components/VisualizationPanel";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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
      <AppHeader />
      <div className="flex h-screen pt-16">
        <TutorialSidebar />
        <main className="flex-1 flex flex-col lg:flex-row">
          <TerminalPanel />
          <VisualizationPanel />
        </main>
      </div>
    </div>
  );
}
