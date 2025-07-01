import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Code,
  Copy
} from "lucide-react";
import { RepositoryState } from "@/lib/gitTypes";

interface CommandSuggestion {
  command: string;
  description: string;
  why: string;
  category: 'basic' | 'intermediate' | 'advanced';
  priority: number;
}

interface InteractiveCommandHelperProps {
  repositoryState: RepositoryState;
  onSuggestCommand: (command: string) => void;
  lastCommand?: string;
}

export default function InteractiveCommandHelper({ 
  repositoryState, 
  onSuggestCommand, 
  lastCommand 
}: InteractiveCommandHelperProps) {
  const [selectedCategory, setSelectedCategory] = useState<'basic' | 'intermediate' | 'advanced'>('basic');

  const getSmartSuggestions = (): CommandSuggestion[] => {
    const { initialized, files, commits, stagedFiles, currentBranch } = repositoryState;
    const suggestions: CommandSuggestion[] = [];

    if (!initialized) {
      suggestions.push({
        command: 'git init',
        description: 'Initialize a new Git repository',
        why: 'You need to create a Git repository before you can track changes',
        category: 'basic',
        priority: 10
      });
      return suggestions;
    }

    // Check for untracked files
    const untrackedFiles = files.filter(f => f.status === 'untracked');
    if (untrackedFiles.length > 0) {
      suggestions.push({
        command: 'git add .',
        description: 'Add all untracked files to staging area',
        why: `You have ${untrackedFiles.length} untracked file(s). Add them to start tracking changes`,
        category: 'basic',
        priority: 8
      });
      
      suggestions.push({
        command: `git add ${untrackedFiles[0].name}`,
        description: 'Add a specific file to staging area',
        why: 'Sometimes you want to add files one by one for more control',
        category: 'basic',
        priority: 7
      });
    }

    // Check for staged files
    const staged = files.filter(f => f.status === 'staged');
    if (staged.length > 0) {
      suggestions.push({
        command: 'git commit -m "Your commit message"',
        description: 'Commit your staged changes',
        why: `You have ${staged.length} staged file(s) ready to be committed`,
        category: 'basic',
        priority: 9
      });
    }

    // General commands always available
    suggestions.push({
      command: 'git status',
      description: 'Check the status of your repository',
      why: 'Always good to know what\'s happening in your repo',
      category: 'basic',
      priority: 6
    });

    if (commits.length > 0) {
      suggestions.push({
        command: 'git log',
        description: 'View commit history',
        why: 'See all the commits you\'ve made so far',
        category: 'basic',
        priority: 5
      });

      suggestions.push({
        command: 'git branch new-feature',
        description: 'Create a new branch',
        why: 'Branches let you work on features without affecting main code',
        category: 'intermediate',
        priority: 6
      });

      if (Object.keys(repositoryState.branches).length > 1) {
        const otherBranches = Object.keys(repositoryState.branches).filter(b => b !== currentBranch);
        if (otherBranches.length > 0) {
          suggestions.push({
            command: `git checkout ${otherBranches[0]}`,
            description: 'Switch to another branch',
            why: 'Move between different branches to work on different features',
            category: 'intermediate',
            priority: 5
          });
        }
      }
    }

    // Advanced commands
    if (commits.length > 1) {
      suggestions.push({
        command: 'git diff',
        description: 'Show changes between files',
        why: 'See exactly what changed in your files',
        category: 'advanced',
        priority: 4
      });
    }

    return suggestions.sort((a, b) => b.priority - a.priority);
  };

  const suggestions = getSmartSuggestions();
  const filteredSuggestions = suggestions.filter(s => s.category === selectedCategory);

  const handleCommandClick = (command: string) => {
    onSuggestCommand(command);
  };

  const copyToClipboard = (command: string) => {
    navigator.clipboard.writeText(command);
  };

  const getStatusIcon = () => {
    if (!repositoryState.initialized) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
    
    const untrackedFiles = repositoryState.files.filter(f => f.status === 'untracked').length;
    const stagedFiles = repositoryState.files.filter(f => f.status === 'staged').length;
    
    if (stagedFiles > 0) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (untrackedFiles > 0) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
    
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getNextStepMessage = () => {
    if (!repositoryState.initialized) {
      return "Start by initializing your Git repository";
    }
    
    const untrackedFiles = repositoryState.files.filter(f => f.status === 'untracked');
    const stagedFiles = repositoryState.files.filter(f => f.status === 'staged');
    
    if (untrackedFiles.length > 0 && stagedFiles.length === 0) {
      return "Add your files to the staging area";
    } else if (stagedFiles.length > 0) {
      return "Commit your staged changes";
    } else if (repositoryState.commits.length === 0) {
      return "Make your first commit";
    } else {
      return "Great! You can now explore branches and advanced features";
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-github-dark dark:text-foreground">
          <Zap className="h-5 w-5 text-yellow-500" />
          <span>Smart Command Helper</span>
          {getStatusIcon()}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {getNextStepMessage()}
        </p>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Category Selection */}
        <div className="flex space-x-2">
          {(['basic', 'intermediate', 'advanced'] as const).map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs capitalize"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Command Suggestions */}
        <div className="space-y-3 flex-1 overflow-y-auto">
          {filteredSuggestions.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Code className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No suggestions for this category yet</p>
            </div>
          ) : (
            filteredSuggestions.map((suggestion, index) => (
              <Card key={index} className="border-l-4 border-l-github-blue">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono bg-github-bg dark:bg-muted px-2 py-1 rounded text-github-dark dark:text-foreground">
                        {suggestion.command}
                      </code>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(suggestion.command)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCommandClick(suggestion.command)}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium text-github-dark dark:text-foreground">
                        {suggestion.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        💡 {suggestion.why}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Last Command Feedback */}
        {lastCommand && (
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs font-medium text-green-800 dark:text-green-200">
                    Last executed:
                  </p>
                  <code className="text-xs font-mono text-green-700 dark:text-green-300">
                    {lastCommand}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}