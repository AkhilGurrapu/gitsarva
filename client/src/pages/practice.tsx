import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Terminal, GitBranch, Users, Zap, Code, BookOpen, Play, RotateCcw } from "lucide-react";
import TerminalPanel from "@/components/TerminalPanel";
import InteractiveGitVisualization from "@/components/InteractiveGitVisualization";
import InteractiveCommandHelper from "@/components/InteractiveCommandHelper";
import ExplanationPanel from "@/components/ExplanationPanel";
import AppHeader from "@/components/AppHeader";
import { useTheme } from "@/contexts/ThemeContext";
import { useGitEngine } from "@/lib/gitEngine";

interface PracticeScenario {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  icon: any;
  estimatedTime: string;
  objectives: string[];
  initialCommands?: string[];
  setupCommands?: string[];
  steps?: {
    step: number;
    title: string;
    description: string;
    command?: string;
    expectedOutput?: string;
    hint?: string;
  }[];
}

const practiceScenarios: PracticeScenario[] = [
  {
    id: "basic-workflow",
    title: "Basic Git Workflow",
    description: "Practice the fundamental Git workflow: add, commit, and status",
    difficulty: "beginner",
    category: "Fundamentals",
    icon: BookOpen,
    estimatedTime: "10-15 min",
    objectives: [
      "Initialize a repository",
      "Create and modify files",
      "Use git add and git commit",
      "Check repository status"
    ],
    setupCommands: ["git init", "echo 'Welcome to GitSarva Practice!' > README.md"],
    steps: [
      {
        step: 1,
        title: "Check Repository Status",
        description: "First, let's see what Git sees in our newly initialized repository",
        command: "git status",
        expectedOutput: "On branch main. Untracked files: README.md",
        hint: "This command shows you the current state of your working directory and staging area"
      },
      {
        step: 2,
        title: "Stage Your First File",
        description: "Add the README.md file to the staging area",
        command: "git add README.md",
        expectedOutput: "No output is normal - Git silently stages the file",
        hint: "The staging area is where you prepare files before committing them"
      },
      {
        step: 3,
        title: "Check Status Again",
        description: "See how the status changed after staging",
        command: "git status",
        expectedOutput: "Changes to be committed: new file: README.md",
        hint: "Notice how the file is now in green, ready to be committed"
      },
      {
        step: 4,
        title: "Make Your First Commit",
        description: "Create a permanent snapshot of your staged changes",
        command: 'git commit -m "Initial commit with README"',
        expectedOutput: "1 file changed, 1 insertion(+)",
        hint: "Commit messages should be clear and describe what you changed"
      },
      {
        step: 5,
        title: "View Commit History",
        description: "See the commit you just created",
        command: "git log --oneline",
        expectedOutput: "Shows your commit with hash and message",
        hint: "This shows a condensed view of your repository's history"
      },
      {
        step: 6,
        title: "Create and Modify Files",
        description: "Create a new file to practice the workflow again",
        command: "echo 'Learning Git is fun!' > practice.txt",
        expectedOutput: "Creates a new file called practice.txt",
        hint: "You can create files with your editor or command line"
      },
      {
        step: 7,
        title: "Stage Multiple Files",
        description: "Add all changes at once",
        command: "git add .",
        expectedOutput: "Stages all changes in current directory",
        hint: "The dot (.) means 'add everything in current directory'"
      },
      {
        step: 8,
        title: "Complete the Workflow",
        description: "Commit your new file",
        command: 'git commit -m "Add practice file"',
        expectedOutput: "Another successful commit",
        hint: "Congratulations! You've completed the basic Git workflow"
      }
    ]
  },
  {
    id: "branching-mastery",
    title: "Branching & Merging",
    description: "Master branch creation, switching, and merging strategies",
    difficulty: "intermediate",
    category: "Branching",
    icon: GitBranch,
    estimatedTime: "20-30 min",
    objectives: [
      "Create feature branches",
      "Switch between branches",
      "Merge branches",
      "Handle merge conflicts"
    ],
    setupCommands: [
      "git init",
      "echo 'Main project file' > main.txt",
      "git add main.txt",
      "git commit -m 'Initial commit'",
      "echo 'Let\\'s practice branching!'"
    ]
  },
  {
    id: "team-collaboration",
    title: "Team Collaboration Simulation",
    description: "Simulate working with a team using feature branches and pull requests",
    difficulty: "intermediate",
    category: "Collaboration",
    icon: Users,
    estimatedTime: "25-35 min",
    objectives: [
      "Create feature branches for different team members",
      "Simulate parallel development",
      "Practice conflict resolution",
      "Follow Git flow methodology"
    ],
    setupCommands: [
      "git init",
      "echo 'Team Project Setup' > project.md",
      "git add project.md",
      "git commit -m 'Initial team project'",
      "echo 'Ready for team collaboration!'"
    ]
  },
  {
    id: "advanced-rebase",
    title: "Rebase & History Rewriting",
    description: "Learn advanced Git techniques for clean commit history",
    difficulty: "advanced",
    category: "Advanced",
    icon: Zap,
    estimatedTime: "30-45 min",
    objectives: [
      "Interactive rebase",
      "Squashing commits",
      "Rewriting commit messages",
      "Cherry-picking commits"
    ],
    setupCommands: [
      "git init",
      "echo 'First feature' > feature1.txt",
      "git add feature1.txt",
      "git commit -m 'Add feature 1'",
      "echo 'Second feature' > feature2.txt",
      "git add feature2.txt",
      "git commit -m 'Add feature 2'",
      "echo 'Third feature' > feature3.txt",
      "git add feature3.txt",
      "git commit -m 'Add feature 3'"
    ]
  },
  {
    id: "debugging-detective",
    title: "Git Detective Work",
    description: "Use Git tools to debug and trace changes in a complex repository",
    difficulty: "advanced",
    category: "Debugging",
    icon: Code,
    estimatedTime: "20-30 min",
    objectives: [
      "Use git log effectively",
      "Trace file history",
      "Use git blame",
      "Bisect to find bugs"
    ],
    setupCommands: [
      "git init",
      "echo 'function buggyCode() { return true; }' > app.js",
      "git add app.js",
      "git commit -m 'Initial app code'",
      "echo 'function buggyCode() { return false; }' > app.js",
      "git add app.js",
      "git commit -m 'Update function logic'",
      "echo 'Bug investigation scenario ready!'"
    ]
  }
];

export default function Practice() {
  const [selectedScenario, setSelectedScenario] = useState<PracticeScenario | null>(null);
  const [activeTab, setActiveTab] = useState("scenarios");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>("");
  const { theme } = useTheme();
  const { getRepositoryState, executeCommand } = useGitEngine();

  const repositoryState = getRepositoryState();

  const handleStartScenario = async (scenario: PracticeScenario) => {
    setSelectedScenario(scenario);
    setActiveTab("playground");
    
    // Execute setup commands if any
    if (scenario.setupCommands && scenario.setupCommands.length > 0) {
      console.log('Setting up scenario:', scenario.setupCommands);
      
      try {
        // Execute each setup command sequentially
        for (const command of scenario.setupCommands) {
          console.log(`Executing setup command: ${command}`);
          await executeCommand(command);
          
          // Small delay to allow visualization to update
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.log('Scenario setup completed successfully!');
      } catch (error) {
        console.error('Error setting up scenario:', error);
      }
    }
  };

  const handleResetPlayground = async () => {
    try {
      // Reset the Git repository to clean state
      await executeCommand("rm -rf .git");
      await executeCommand("rm -rf *");
      console.log('Repository reset successfully');
    } catch (error) {
      console.error('Error resetting repository:', error);
    }
    
    setSelectedScenario(null);
    setActiveTab("scenarios");
  };

  const handleCommandSuggestion = (command: string) => {
    setLastCommand(command);
    // This will suggest the command in terminal for user to execute manually
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "advanced": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Consistent Header */}
      <AppHeader 
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Main Content - Allow full page scrolling */}
      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="min-h-full">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-github-blue text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              <div className="text-center space-y-3 sm:space-y-4">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  🚀 Git Practice Sandbox
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed px-2">
                  Master Git through hands-on practice in a safe, interactive environment with real terminal and visualization
                </p>
                {selectedScenario && (
                  <Button 
                    onClick={handleResetPlayground}
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Reset Playground</span>
                    <span className="sm:hidden">Reset</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
              <TabsList className="grid w-full grid-cols-3 max-w-xs sm:max-w-md mx-auto">
                <TabsTrigger value="scenarios" className="text-xs sm:text-sm">
                  <span className="hidden sm:inline">Practice Scenarios</span>
                  <span className="sm:hidden">Scenarios</span>
                </TabsTrigger>
                <TabsTrigger value="playground" className="text-xs sm:text-sm">
                  <span className="hidden sm:inline">Interactive Playground</span>
                  <span className="sm:hidden">Playground</span>
                </TabsTrigger>
                <TabsTrigger value="free-play" className="text-xs sm:text-sm">
                  <span className="hidden sm:inline">Free Play</span>
                  <span className="sm:hidden">Free Play</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Practice Scenarios Tab */}
          <TabsContent value="scenarios" className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4 sm:space-y-6">
              {/* Filter & Selection */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
                <Select>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="fundamentals">Fundamentals</SelectItem>
                    <SelectItem value="branching">Branching</SelectItem>
                    <SelectItem value="collaboration">Collaboration</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="debugging">Debugging</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Scenarios Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {practiceScenarios.map((scenario) => {
                  const Icon = scenario.icon;
                  return (
                    <Card key={scenario.id} className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-github-blue/50 dark:hover:border-github-blue/50">
                      <CardHeader className="p-4 sm:p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-github-blue to-purple-600">
                              <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-gray-100 group-hover:text-github-blue transition-colors">
                                {scenario.title}
                              </CardTitle>
                              <div className="flex gap-2 mt-2">
                                <Badge className={getDifficultyColor(scenario.difficulty)}>
                                  {scenario.difficulty}
                                </Badge>
                                <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                  {scenario.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6 space-y-4">
                        <CardDescription className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                          {scenario.description}
                        </CardDescription>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Terminal className="h-4 w-4" />
                            <span>{scenario.estimatedTime}</span>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Learning Objectives:</p>
                            <ul className="space-y-1">
                              {scenario.objectives.map((objective, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <div className="w-1.5 h-1.5 bg-github-blue rounded-full mt-2 flex-shrink-0" />
                                  <span>{objective}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => handleStartScenario(scenario)}
                          className="w-full bg-gradient-to-r from-github-blue to-purple-600 hover:from-github-blue/90 hover:to-purple-600/90 text-white gap-2 text-sm sm:text-base"
                        >
                          <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                          Start Practice
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Interactive Playground Tab */}
          <TabsContent value="playground" className="flex-1 overflow-hidden">
            {selectedScenario ? (
              <div className="h-full">
                {/* Scenario Header */}
                <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 sm:p-4">
                  <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                          <selectedScenario.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg sm:text-xl font-semibold text-white">{selectedScenario.title}</h2>
                          <p className="text-sm sm:text-base text-green-100">{selectedScenario.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={`${getDifficultyColor(selectedScenario.difficulty)} border-white/20 text-xs sm:text-sm`}>
                          {selectedScenario.difficulty}
                        </Badge>
                        <Badge variant="outline" className="border-white/30 text-white text-xs sm:text-sm">
                          {selectedScenario.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scrollable 4-Panel Layout */}
                <div className="flex-1 min-h-0">
                  <div className="h-full flex flex-col lg:grid lg:grid-cols-12 lg:gap-1">
                    {/* Terminal Panel - Always scrollable */}
                    <div className="min-h-64 max-h-80 lg:h-full lg:col-span-6 bg-white dark:bg-gray-800 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 flex flex-col" data-walkthrough="terminal-panel">
                      <div className="flex-shrink-0 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 text-gray-900 dark:text-gray-100">
                          <Terminal className="h-4 w-4 sm:h-5 sm:w-5 text-github-blue" />
                          <span className="hidden sm:inline">Interactive Terminal</span>
                          <span className="sm:hidden">Terminal</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Practice Git commands in real-time</p>
                      </div>
                      <div className="flex-1 min-h-0 overflow-auto">
                        <TerminalPanel 
                          onCommandExecuted={setLastCommand}
                          suggestedCommand={lastCommand}
                        />
                      </div>
                    </div>

                    {/* Right Side Panels */}
                    <div className="flex-1 lg:col-span-6 flex flex-col min-h-0">
                      {/* Git Visualization - Scrollable */}
                      <div className="min-h-64 max-h-80 lg:flex-1 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex flex-col" data-walkthrough="git-visualization">
                        <div className="flex-shrink-0 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                          <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            <GitBranch className="h-4 w-4 sm:h-5 sm:w-5 text-github-blue" />
                            <span className="hidden sm:inline">Git Visualization</span>
                            <span className="sm:hidden">Visualization</span>
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Watch your repository evolve</p>
                        </div>
                        <div className="flex-1 min-h-0 overflow-auto">
                          <InteractiveGitVisualization 
                            repositoryState={repositoryState}
                            onCommandSuggestion={handleCommandSuggestion}
                          />
                        </div>
                      </div>

                      {/* Bottom Panels - All scrollable */}
                      <div className="flex-1 lg:flex-1 flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-2 min-h-0">
                        {/* Command Helper - Full scroll capability */}
                        <div className="min-h-48 sm:h-auto bg-white dark:bg-gray-800 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-700 flex flex-col" data-walkthrough="command-helper">
                          <div className="flex-shrink-0 p-2 sm:p-3 border-b border-gray-200 dark:border-gray-700">
                            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Command Helper</h4>
                          </div>
                          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                            <InteractiveCommandHelper 
                              repositoryState={repositoryState}
                              onSuggestCommand={handleCommandSuggestion}
                              lastCommand={lastCommand}
                            />
                          </div>
                        </div>

                        {/* Explanation Panel - Full scroll capability */}
                        <div className="min-h-48 sm:h-auto bg-white dark:bg-gray-800 flex flex-col" data-walkthrough="explanation-panel">
                          <div className="flex-shrink-0 p-2 sm:p-3 border-b border-gray-200 dark:border-gray-700">
                            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Explanations</h4>
                          </div>
                          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                            <ExplanationPanel 
                              currentCommand={lastCommand}
                              repositoryState={repositoryState}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scrollable Objectives and Steps Panel */}
                <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                  <div className="p-4 sm:p-6">
                    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                      {/* Objectives */}
                      <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                          <BookOpen className="h-4 w-4" />
                          Practice Objectives for {selectedScenario.title}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                          {selectedScenario.objectives.map((objective, index) => (
                            <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                              <div className="w-2 h-2 bg-github-blue rounded-full flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{objective}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Step-by-Step Guide */}
                      {selectedScenario.steps && selectedScenario.steps.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            <Terminal className="h-4 w-4" />
                            Step-by-Step Guide
                          </h3>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {selectedScenario.steps.map((step, index) => (
                              <Card key={index} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-l-4 border-l-github-blue">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    <Badge className="bg-github-blue text-white px-2 py-1 text-xs">
                                      Step {step.step}
                                    </Badge>
                                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">{step.title}</h4>
                                  </div>
                                  
                                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {step.description}
                                  </p>
                                  
                                  {step.command && (
                                    <div className="space-y-2">
                                      <div className="bg-gray-900 dark:bg-gray-950 rounded-md p-3">
                                        <code className="text-green-400 text-sm font-mono">
                                          $ {step.command}
                                        </code>
                                      </div>
                                      {step.expectedOutput && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                          Expected: {step.expectedOutput}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                  
                                  {step.hint && (
                                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                                      <p className="text-xs text-blue-800 dark:text-blue-200">
                                        💡 <strong>Hint:</strong> {step.hint}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-github-blue to-purple-600 rounded-full flex items-center justify-center mx-auto">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Ready to Practice?</h3>
                  <p className="text-muted-foreground max-w-md">
                    Select a practice scenario to start your interactive Git learning journey with full terminal and visualization support.
                  </p>
                  <Button onClick={() => setActiveTab("scenarios")} className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Browse Scenarios
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Free Play Tab */}
          <TabsContent value="free-play" className="flex-1 overflow-hidden">
            <div className="h-full">
              {/* Free Play Header */}
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6">
                <div className="max-w-7xl mx-auto">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Free Play Mode</h2>
                      <p className="text-purple-100">
                        Experiment freely with Git commands in an unrestricted sandbox environment
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4-Panel Layout matching home page */}
              <div className="flex-1 h-full grid grid-cols-12 gap-1">
                {/* Terminal Panel (left) */}
                <div className="col-span-6 bg-white dark:bg-gray-800 border-r border-border">
                  <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-border">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Terminal className="h-5 w-5 text-github-blue" />
                        Free Play Terminal
                      </h3>
                      <p className="text-sm text-muted-foreground">Experiment with any Git commands</p>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <TerminalPanel 
                        onCommandExecuted={setLastCommand}
                        suggestedCommand={lastCommand}
                      />
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="col-span-6 flex flex-col">
                  {/* Git Visualization */}
                  <div className="flex-1 bg-white dark:bg-gray-800 border-b border-border">
                    <div className="h-full flex flex-col">
                      <div className="p-4 border-b border-border">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <GitBranch className="h-5 w-5 text-github-blue" />
                          Repository Visualization
                        </h3>
                        <p className="text-sm text-muted-foreground">Watch your experiments in real-time</p>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <InteractiveGitVisualization 
                          repositoryState={repositoryState}
                          onCommandSuggestion={handleCommandSuggestion}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom right panels */}
                  <div className="flex-1 grid grid-cols-2">
                    <div className="bg-white dark:bg-gray-800 border-r border-border">
                      <div className="h-full flex flex-col">
                        <div className="p-3 border-b border-border">
                          <h4 className="font-medium text-sm">Command Helper</h4>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <InteractiveCommandHelper 
                            repositoryState={repositoryState}
                            onSuggestCommand={handleCommandSuggestion}
                            lastCommand={lastCommand}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800">
                      <div className="h-full flex flex-col">
                        <div className="p-3 border-b border-border">
                          <h4 className="font-medium text-sm">Explanations</h4>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <ExplanationPanel 
                            currentCommand={lastCommand}
                            repositoryState={repositoryState}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 