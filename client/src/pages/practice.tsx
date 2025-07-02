import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Terminal, GitBranch, Users, Zap, Code, BookOpen, Play, RotateCcw, HelpCircle, Eye, Lightbulb, Command } from "lucide-react";
import TerminalPanel from "@/components/TerminalPanel";
import InteractiveGitVisualization from "@/components/InteractiveGitVisualization";
import InteractiveCommandHelper from "@/components/InteractiveCommandHelper";
import ExplanationPanel from "@/components/ExplanationPanel";
import AppHeader from "@/components/AppHeader";
import { useTheme } from "@/contexts/ThemeContext";
import { useGitEngine } from "@/lib/gitEngine";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [lastCommand, setLastCommand] = useState<string>("");
  const [showVisualization, setShowVisualization] = useState(true);
  const [showCommandHelper, setShowCommandHelper] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppHeader 
        onToggleMobileSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
        onStartWalkthrough={() => {}}
      />

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileSidebar(false)}>
          <div className="absolute left-0 top-16 bottom-0 w-4/5 max-w-sm bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Practice Navigation</h3>
              <div className="space-y-2">
                <Button 
                  variant={activeTab === "scenarios" ? "default" : "outline"} 
                  className="w-full justify-start"
                  onClick={() => {setActiveTab("scenarios"); setShowMobileSidebar(false);}}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Practice Scenarios
                </Button>
                <Button 
                  variant={activeTab === "playground" ? "default" : "outline"} 
                  className="w-full justify-start"
                  onClick={() => {setActiveTab("playground"); setShowMobileSidebar(false);}}
                  disabled={!selectedScenario}
                >
                  <Terminal className="h-4 w-4 mr-2" />
                  Interactive Playground
                </Button>
                <Button 
                  variant={activeTab === "free-play" ? "default" : "outline"} 
                  className="w-full justify-start"
                  onClick={() => {setActiveTab("free-play"); setShowMobileSidebar(false);}}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Free Play
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-16">
        <TooltipProvider>
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
                <TabsList className="grid w-full grid-cols-3 max-w-xs sm:max-w-md mx-auto bg-gray-100 dark:bg-gray-700">
                  <TabsTrigger value="scenarios" className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">
                  <span className="hidden sm:inline">Practice Scenarios</span>
                  <span className="sm:hidden">Scenarios</span>
                </TabsTrigger>
                  <TabsTrigger value="playground" className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">
                  <span className="hidden sm:inline">Interactive Playground</span>
                  <span className="sm:hidden">Playground</span>
                </TabsTrigger>
                  <TabsTrigger value="free-play" className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">
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
                    <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Filter by difficulty" />
                  </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                      <SelectItem value="all" className="text-gray-900 dark:text-gray-100">All Levels</SelectItem>
                      <SelectItem value="beginner" className="text-gray-900 dark:text-gray-100">Beginner</SelectItem>
                      <SelectItem value="intermediate" className="text-gray-900 dark:text-gray-100">Intermediate</SelectItem>
                      <SelectItem value="advanced" className="text-gray-900 dark:text-gray-100">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select>
                    <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                      <SelectItem value="all" className="text-gray-900 dark:text-gray-100">All Categories</SelectItem>
                      <SelectItem value="fundamentals" className="text-gray-900 dark:text-gray-100">Fundamentals</SelectItem>
                      <SelectItem value="branching" className="text-gray-900 dark:text-gray-100">Branching</SelectItem>
                      <SelectItem value="collaboration" className="text-gray-900 dark:text-gray-100">Collaboration</SelectItem>
                      <SelectItem value="advanced" className="text-gray-900 dark:text-gray-100">Advanced</SelectItem>
                      <SelectItem value="debugging" className="text-gray-900 dark:text-gray-100">Debugging</SelectItem>
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

            {/* Modern Clean Playground Tab */}
            <TabsContent value="playground" className="flex-1 min-h-[calc(100vh-8rem)]">
            {selectedScenario ? (
                <div className="h-full flex flex-col">
                {/* Scenario Header */}
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <selectedScenario.icon className="h-6 w-6 text-white" />
                        <div>
                          <h2 className="text-xl font-semibold text-white">{selectedScenario.title}</h2>
                          <p className="text-green-100 text-sm">{selectedScenario.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-white/20 text-white border-white/30">
                          {selectedScenario.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Clean Modern Playground Layout */}
                  <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex">
                    {/* Main Terminal Area - Takes center stage */}
                    <div className="flex-1 flex flex-col">
                      {/* Terminal */}
                      <div className="flex-1 bg-gray-900 dark:bg-gray-950 m-4 rounded-lg overflow-hidden shadow-2xl border border-gray-700">
                        <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                          <span className="text-gray-300 text-sm font-mono">GitSarva Terminal</span>
                      </div>
                        <div className="h-full">
                        <TerminalPanel 
                          onCommandExecuted={setLastCommand}
                          suggestedCommand={lastCommand}
                        />
                      </div>
                    </div>

                      {/* Helper Tool Icons Bar */}
                      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-center gap-4">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={showVisualization ? "default" : "outline"}
                                size="sm"
                                onClick={() => setShowVisualization(!showVisualization)}
                                className={`gap-2 ${showVisualization 
                                  ? 'bg-github-blue text-white hover:bg-github-blue/90' 
                                  : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                }`}
                              >
                                <Eye className="h-4 w-4" />
                                Visualization
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Toggle Git tree visualization</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={showCommandHelper ? "default" : "outline"}
                                size="sm"
                                onClick={() => setShowCommandHelper(!showCommandHelper)}
                                className={`gap-2 ${showCommandHelper 
                                  ? 'bg-github-blue text-white hover:bg-github-blue/90' 
                                  : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                }`}
                              >
                                <Command className="h-4 w-4" />
                                Commands
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Toggle command helper</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={showExplanations ? "default" : "outline"}
                                size="sm"
                                onClick={() => setShowExplanations(!showExplanations)}
                                className={`gap-2 ${showExplanations 
                                  ? 'bg-github-blue text-white hover:bg-github-blue/90' 
                                  : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                }`}
                              >
                                <Lightbulb className="h-4 w-4" />
                                Explain
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Toggle explanations panel</TooltipContent>
                          </Tooltip>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="gap-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <HelpCircle className="h-4 w-4" />
                                Guide
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                  <BookOpen className="h-5 w-5" />
                                  {selectedScenario.title} - Practice Guide
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6">
                                {/* Objectives */}
                                <div>
                                  <h3 className="font-medium mb-3 text-lg text-gray-900 dark:text-gray-100">Learning Objectives</h3>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {selectedScenario.objectives.map((objective, index) => (
                                      <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                                        <div className="w-2 h-2 bg-github-blue rounded-full" />
                                        <span className="text-sm text-gray-900 dark:text-gray-100">{objective}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Steps */}
                                {selectedScenario.steps && (
                                  <div>
                                    <h3 className="font-medium mb-4 text-lg text-gray-900 dark:text-gray-100">Step-by-Step Guide</h3>
                                    <div className="space-y-4">
                                      {selectedScenario.steps.map((step, index) => (
                                        <Card key={index} className="p-4 border-l-4 border-l-github-blue bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                                          <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                              <Badge className="bg-github-blue text-white">
                                                Step {step.step}
                                              </Badge>
                                              <h4 className="font-medium text-gray-900 dark:text-gray-100">{step.title}</h4>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                                            {step.command && (
                                              <div className="bg-gray-900 rounded p-3">
                                                <code className="text-green-400 font-mono text-sm">$ {step.command}</code>
                                              </div>
                                            )}
                                            {step.hint && (
                                              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded p-3">
                                                <p className="text-sm text-blue-800 dark:text-blue-200">💡 {step.hint}</p>
                                              </div>
                                            )}
                                          </div>
                                        </Card>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Side Panel */}
                    {(showVisualization || showCommandHelper || showExplanations) && (
                      <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
                        {showVisualization && (
                          <div className="flex-1 border-b border-gray-200 dark:border-gray-700">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                              <h3 className="font-medium flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                <GitBranch className="h-4 w-4" />
                                Git Visualization
                              </h3>
                            </div>
                            <div className="flex-1 overflow-hidden">
                          <InteractiveGitVisualization 
                            repositoryState={repositoryState}
                            onCommandSuggestion={handleCommandSuggestion}
                          />
                        </div>
                      </div>
                        )}

                        {showCommandHelper && (
                          <div className="flex-1 border-b border-gray-200 dark:border-gray-700">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                              <h3 className="font-medium flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                <Command className="h-4 w-4" />
                                Command Helper
                              </h3>
                          </div>
                            <div className="flex-1 overflow-auto">
                            <InteractiveCommandHelper 
                              repositoryState={repositoryState}
                              onSuggestCommand={handleCommandSuggestion}
                              lastCommand={lastCommand}
                            />
                          </div>
                        </div>
                        )}

                        {showExplanations && (
                          <div className="flex-1">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                              <h3 className="font-medium flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                <Lightbulb className="h-4 w-4" />
                                Explanations
                              </h3>
                          </div>
                            <div className="flex-1 overflow-auto">
                            <ExplanationPanel 
                              currentCommand={lastCommand}
                              repositoryState={repositoryState}
                            />
                          </div>
                        </div>
                        )}
                        </div>
                      )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-github-blue to-purple-600 rounded-full flex items-center justify-center mx-auto">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Ready to Practice?</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                      Select a practice scenario to start your interactive Git learning journey.
                  </p>
                  <Button onClick={() => setActiveTab("scenarios")} className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Browse Scenarios
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

            {/* Free Play Tab - Also with clean design */}
            <TabsContent value="free-play" className="flex-1 min-h-[calc(100vh-8rem)]">
              <div className="h-full flex flex-col">
              {/* Free Play Header */}
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4">
                  <div className="max-w-7xl mx-auto flex items-center gap-4">
                      <Zap className="h-6 w-6 text-white" />
                    <div>
                      <h2 className="text-xl font-bold text-white">Free Play Mode</h2>
                      <p className="text-purple-100 text-sm">
                        Experiment freely with Git commands in an unrestricted environment
                      </p>
                    </div>
                  </div>
                </div>

                {/* Clean Free Play Layout */}
                <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex">
                  {/* Terminal */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1 bg-gray-900 dark:bg-gray-950 m-4 rounded-lg overflow-hidden shadow-2xl border border-gray-700">
                      <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
                        <span className="text-gray-300 text-sm font-mono">Free Play Terminal</span>
                    </div>
                      <div className="h-full">
                      <TerminalPanel 
                        onCommandExecuted={setLastCommand}
                        suggestedCommand={lastCommand}
                      />
                  </div>
                </div>

                    {/* Helper Tools */}
                    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex items-center justify-center gap-4">
                        <Button
                          variant={showVisualization ? "default" : "outline"}
                          size="sm"
                          onClick={() => setShowVisualization(!showVisualization)}
                          className={`gap-2 ${showVisualization 
                            ? 'bg-github-blue text-white hover:bg-github-blue/90' 
                            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          <Eye className="h-4 w-4" />
                          Visualization
                        </Button>
                        <Button
                          variant={showCommandHelper ? "default" : "outline"}
                          size="sm"
                          onClick={() => setShowCommandHelper(!showCommandHelper)}
                          className={`gap-2 ${showCommandHelper 
                            ? 'bg-github-blue text-white hover:bg-github-blue/90' 
                            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          <Command className="h-4 w-4" />
                          Commands
                        </Button>
                        <Button
                          variant={showExplanations ? "default" : "outline"}
                          size="sm"
                          onClick={() => setShowExplanations(!showExplanations)}
                          className={`gap-2 ${showExplanations 
                            ? 'bg-github-blue text-white hover:bg-github-blue/90' 
                            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          <Lightbulb className="h-4 w-4" />
                          Explain
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Side Panel */}
                  {(showVisualization || showCommandHelper || showExplanations) && (
                    <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
                      {showVisualization && (
                        <div className="flex-1 border-b border-gray-200 dark:border-gray-700">
                          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-medium flex items-center gap-2 text-gray-900 dark:text-gray-100">
                              <GitBranch className="h-4 w-4" />
                              Git Visualization
                            </h3>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <InteractiveGitVisualization 
                          repositoryState={repositoryState}
                          onCommandSuggestion={handleCommandSuggestion}
                        />
                      </div>
                    </div>
                      )}

                      {showCommandHelper && (
                        <div className="flex-1 border-b border-gray-200 dark:border-gray-700">
                          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-medium flex items-center gap-2 text-gray-900 dark:text-gray-100">
                              <Command className="h-4 w-4" />
                              Command Helper
                            </h3>
                        </div>
                          <div className="flex-1 overflow-auto">
                          <InteractiveCommandHelper 
                            repositoryState={repositoryState}
                            onSuggestCommand={handleCommandSuggestion}
                            lastCommand={lastCommand}
                          />
                        </div>
                      </div>
                      )}

                      {showExplanations && (
                        <div className="flex-1">
                          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-medium flex items-center gap-2 text-gray-900 dark:text-gray-100">
                              <Lightbulb className="h-4 w-4" />
                              Explanations
                            </h3>
                    </div>
                          <div className="flex-1 overflow-auto">
                          <ExplanationPanel 
                            currentCommand={lastCommand}
                            repositoryState={repositoryState}
                          />
                        </div>
                      </div>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        </TooltipProvider>
      </div>
    </div>
  );
} 