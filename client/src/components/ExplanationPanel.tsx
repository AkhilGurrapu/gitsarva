import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  GitBranch, 
  FileText, 
  ArrowRight, 
  Lightbulb,
  CheckCircle,
  Clock,
  Target
} from "lucide-react";

interface ConceptExplanation {
  id: string;
  title: string;
  description: string;
  commands: string[];
  example: string;
  tips: string[];
}

const gitConcepts: ConceptExplanation[] = [
  {
    id: "repository",
    title: "Repository (Repo)",
    description: "A repository is like a project folder that tracks all changes to your files over time. Think of it as a time machine for your code.",
    commands: ["git init", "git status"],
    example: "git init creates a new repository in your current folder",
    tips: [
      "Every Git repository has a hidden .git folder that stores all the version history",
      "You can turn any folder into a Git repository with 'git init'",
      "Use 'git status' to see what's happening in your repository"
    ]
  },
  {
    id: "staging",
    title: "Staging Area",
    description: "The staging area is like a preparation room where you decide which changes to include in your next commit. It's a middle step between your working files and permanent history.",
    commands: ["git add", "git add .", "git reset"],
    example: "git add README.md prepares README.md for the next commit",
    tips: [
      "Think of staging as 'preparing your changes for a photo'",
      "You can add specific files or all changes with 'git add .'",
      "Use 'git reset' to unstage files if you change your mind"
    ]
  },
  {
    id: "commit",
    title: "Commit",
    description: "A commit is like taking a snapshot of your project at a specific moment. Each commit saves the current state of all staged files with a descriptive message.",
    commands: ["git commit -m", "git log"],
    example: "git commit -m 'Add user login feature' saves your changes with a message",
    tips: [
      "Write clear, descriptive commit messages",
      "Commits are permanent - they create a history you can always go back to",
      "Use 'git log' to see all your previous commits"
    ]
  },
  {
    id: "branch",
    title: "Branches",
    description: "Branches let you work on different features or experiments without affecting your main code. It's like having parallel universes of your project.",
    commands: ["git branch", "git checkout", "git merge"],
    example: "git branch feature-login creates a new branch for working on login",
    tips: [
      "The main branch is usually called 'main' or 'master'",
      "Create new branches for each feature or experiment",
      "Switch between branches with 'git checkout'"
    ]
  }
];

interface ExplanationPanelProps {
  currentCommand?: string;
  repositoryState?: any;
}

export default function ExplanationPanel({ currentCommand, repositoryState }: ExplanationPanelProps) {
  const [selectedConcept, setSelectedConcept] = useState<string>("repository");
  const [isExpanded, setIsExpanded] = useState(true);

  const selectedExplanation = gitConcepts.find(c => c.id === selectedConcept);

  const getRelevantConcept = (command: string): string => {
    if (command.includes("init")) return "repository";
    if (command.includes("add")) return "staging";
    if (command.includes("commit")) return "commit";
    if (command.includes("branch") || command.includes("checkout")) return "branch";
    return selectedConcept;
  };

  const getCurrentStatus = () => {
    if (!repositoryState) return null;
    
    const { initialized, stagedFiles, files, commits } = repositoryState;
    
    if (!initialized) {
      return {
        phase: "Not Initialized",
        description: "No Git repository yet. Start with 'git init'",
        icon: Clock,
        color: "text-gray-500"
      };
    }
    
    if (commits.length === 0) {
      return {
        phase: "New Repository",
        description: "Repository created, ready for first commit",
        icon: Target,
        color: "text-blue-500"
      };
    }
    
    const untrackedFiles = files.filter((f: any) => f.status === 'untracked').length;
    const modifiedFiles = files.filter((f: any) => f.status === 'modified').length;
    
    if (stagedFiles.length > 0) {
      return {
        phase: "Changes Staged",
        description: `${stagedFiles.length} file(s) ready to commit`,
        icon: CheckCircle,
        color: "text-green-500"
      };
    }
    
    if (untrackedFiles > 0 || modifiedFiles > 0) {
      return {
        phase: "Changes Detected",
        description: `${untrackedFiles + modifiedFiles} file(s) modified`,
        icon: FileText,
        color: "text-yellow-500"
      };
    }
    
    return {
      phase: "Clean Working Tree",
      description: "All changes committed",
      icon: CheckCircle,
      color: "text-green-500"
    };
  };

  const status = getCurrentStatus();

  return (
    <div className="w-full max-w-2xl mx-auto bg-github-bg dark:bg-card rounded-lg border border-border shadow-lg max-h-[80vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-border bg-gradient-to-r from-github-blue/10 to-blue-500/10 dark:from-github-blue/5 dark:to-blue-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-github-blue/10 dark:bg-github-blue/20 rounded-full">
              <Lightbulb className="h-5 w-5 text-github-blue" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-github-dark dark:text-foreground">
                Learn & Understand
              </h2>
              <p className="text-sm text-muted-foreground">
                Master Git concepts with interactive explanations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Status */}
      {status && (
        <div className="p-4 sm:p-6 bg-github-bg/50 dark:bg-muted/30 border-b border-border">
          <div className="flex items-center space-x-3">
            <status.icon className={`h-5 w-5 ${status.color}`} />
            <div>
              <div className="text-sm font-semibold text-github-dark dark:text-foreground">
                {status.phase}
              </div>
              <div className="text-xs text-muted-foreground">
                {status.description}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Concept Selection */}
      <div className="p-4 sm:p-6 border-b border-border">
        <h3 className="text-sm font-semibold text-github-dark dark:text-foreground mb-3">
          Choose a Git concept to explore:
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {gitConcepts.map(concept => (
            <Button
              key={concept.id}
              variant={selectedConcept === concept.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedConcept(concept.id)}
              className="text-xs h-9 px-3 justify-start"
            >
              {concept.title}
            </Button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {selectedExplanation && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            {/* Title and Description */}
            <div>
              <h3 className="text-lg font-bold text-github-dark dark:text-foreground mb-2">
                {selectedExplanation.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedExplanation.description}
              </p>
            </div>

            {/* Commands */}
            <div className="bg-github-bg/70 dark:bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-github-dark dark:text-foreground mb-3 flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Related Commands</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedExplanation.commands.map(cmd => (
                  <Badge key={cmd} variant="secondary" className="text-xs font-mono px-2 py-1">
                    {cmd}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Example */}
            <div className="bg-github-dark text-git-green rounded-lg p-4">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Example Usage</span>
              </h4>
              <div className="text-sm font-mono">
                $ {selectedExplanation.example}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-github-blue/5 dark:bg-blue-900/20 rounded-lg p-4 border border-github-blue/20 dark:border-blue-800/30">
              <h4 className="text-sm font-semibold text-github-dark dark:text-foreground mb-3 flex items-center space-x-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span>Pro Tips</span>
              </h4>
              <ul className="space-y-2">
                {selectedExplanation.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                    <span className="text-github-blue mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}