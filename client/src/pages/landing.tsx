import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoginForm from "@/components/LoginForm";
import { GitBranch, Code, Trophy, Users, BookOpen, Terminal } from "lucide-react";

export default function Landing() {
  const handleLoginSuccess = (userData: any) => {
    // Refresh the page to trigger auth state update
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-github-bg dark:bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-8">
              <div className="flex items-center justify-center h-16 w-16 bg-gradient-to-br from-git-red to-github-blue rounded-xl">
                <span className="text-white font-bold text-2xl">GS</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-github-dark dark:text-foreground">
                GitSarva
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Master Git and GitHub through interactive tutorials, visual sandbox, and hands-on challenges. 
              Learn version control the intuitive way.
            </p>
            <div className="flex justify-center">
              <LoginForm onLoginSuccess={handleLoginSuccess} />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white dark:bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-github-dark dark:text-foreground mb-4">
              Learn Git Like Never Before
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Interactive learning platform designed to make Git concepts visual and intuitive
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-github-blue transition-colors">
              <CardContent className="p-6">
                <Terminal className="h-12 w-12 text-github-blue mb-4" />
                <h3 className="text-xl font-semibold text-github-dark dark:text-foreground mb-2">
                  Interactive Terminal
                </h3>
                <p className="text-muted-foreground">
                  Practice Git commands in a safe sandbox environment with real-time feedback and guidance.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-git-green transition-colors">
              <CardContent className="p-6">
                <GitBranch className="h-12 w-12 text-git-green mb-4" />
                <h3 className="text-xl font-semibold text-github-dark dark:text-foreground mb-2">
                  Visual Git Tree
                </h3>
                <p className="text-muted-foreground">
                  See your repository state change in real-time with beautiful branch visualizations.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-success-green transition-colors">
              <CardContent className="p-6">
                <BookOpen className="h-12 w-12 text-success-green mb-4" />
                <h3 className="text-xl font-semibold text-github-dark dark:text-foreground mb-2">
                  Step-by-Step Tutorials
                </h3>
                <p className="text-muted-foreground">
                  Learn from beginner to advanced concepts with guided lessons and explanations.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-github-blue transition-colors">
              <CardContent className="p-6">
                <Trophy className="h-12 w-12 text-github-blue mb-4" />
                <h3 className="text-xl font-semibold text-github-dark dark:text-foreground mb-2">
                  Achievements & Progress
                </h3>
                <p className="text-muted-foreground">
                  Track your learning journey with achievements and personalized progress tracking.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-git-green transition-colors">
              <CardContent className="p-6">
                <Code className="h-12 w-12 text-git-green mb-4" />
                <h3 className="text-xl font-semibold text-github-dark dark:text-foreground mb-2">
                  Real Git Commands
                </h3>
                <p className="text-muted-foreground">
                  Learn with actual Git commands and workflows used by professional developers.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-success-green transition-colors">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-success-green mb-4" />
                <h3 className="text-xl font-semibold text-github-dark dark:text-foreground mb-2">
                  GitHub Integration
                </h3>
                <p className="text-muted-foreground">
                  Connect your learning to real GitHub workflows and collaboration patterns.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-github-dark">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Master Git?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of developers who have improved their Git skills with our interactive platform.
          </p>
          <p className="text-gray-300">
            Login above to get started with GitSarva!
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-github-bg dark:bg-background border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2">
            <GitBranch className="h-6 w-6 text-git-red" />
            <span className="text-lg font-semibold text-github-dark dark:text-foreground">
              GitSarva
            </span>
          </div>
          <p className="text-center text-muted-foreground mt-4">
            Interactive Git learning platform for developers
          </p>
        </div>
      </footer>
    </div>
  );
}
