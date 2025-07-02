import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  BookOpen,
  Lightbulb,
  AlertCircle,
  Target,
  Globe,
  FileText,
  GitBranch,
  Folder,
  Terminal,
  Users,
  Clock,
  X
} from "lucide-react";

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

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson | null;
  onSuggestCommand?: (command: string) => void;
}

interface LessonStep {
  id: number;
  title: string;
  content: string;
  visual?: string;
  example?: string;
  tryIt?: string;
  command?: string;
}

const getLessonSteps = (lessonId: number): LessonStep[] => {
  const stepsMap: Record<number, LessonStep[]> = {
    1: [
      {
        id: 1,
        title: "🤔 The Problem: Life Without Version Control",
        content: "Imagine you're writing a college essay with your friends. Sarah emails you 'Final_Essay.docx', then Jake sends 'Final_Essay_UPDATED.docx', then you make changes and save 'Final_Essay_FINAL.docx'. Later, Sarah sends 'Final_Essay_FINAL_FINAL.docx'... Sound familiar? 😅",
        visual: "📧 Email chains, confused file names, lost work, conflicts",
        example: "Real scenario: A software team of 5 developers working on an app. Without version control, they'd email code files back and forth, constantly overwriting each other's work and losing hours of progress.",
        tryIt: "Think about a time you lost work because files got mixed up or overwritten."
      },
      {
        id: 2,
        title: "💡 The Solution: Version Control Magic",
        content: "Version control is like having a magical filing cabinet that remembers every version of every file, who changed what, when they changed it, and why. It's like having a time machine for your projects!",
        visual: "🗂️ Organized timeline of all changes, with names and dates",
        example: "When Google Docs tracks changes and lets you see revision history - that's version control in action! Git does this for code projects.",
        tryIt: "Open a Google Doc and click 'Version history' to see how change tracking works."
      },
      {
        id: 3,
        title: "🏠 GitSarva: Your Safe Learning Space",
        content: "GitSarva is like a driving simulator for Git - you get all the real experience without any risk! Every command you learn here works exactly the same in the real world.",
        visual: "🌐 Browser-based sandbox = Real Git commands without installation",
        example: "Just like flight simulators train pilots, GitSarva trains developers. The commands, concepts, and workflows are identical to professional Git.",
        tryIt: "You're already using GitSarva! Notice how it feels like a real terminal."
      }
    ],
    2: [
      {
        id: 1,
        title: "🔧 Git: The Tool (Like Microsoft Word)",
        content: "Git is software that runs on your computer. It's the engine that tracks changes, manages versions, and handles all the version control magic. Think of it as the Microsoft Word of version control.",
        visual: "💻 Git = Software installed on your computer",
        example: "Just like you install Microsoft Word to edit documents, developers install Git to manage code versions. Git runs locally on your machine.",
        tryIt: "Imagine Git as your personal assistant that never forgets any change you make."
      },
      {
        id: 2,
        title: "☁️ GitHub: The Platform (Like Google Drive)",
        content: "GitHub is a website that stores your Git repositories in the cloud and adds collaboration features. It's like Google Drive but specifically designed for code projects managed with Git.",
        visual: "🌐 GitHub = Cloud storage + collaboration features",
        example: "Git manages your local files, GitHub stores copies online and lets teams collaborate. Like how you edit in Word locally but store files on Google Drive for sharing.",
        tryIt: "Visit github.com to see millions of public code projects stored there."
      },
      {
        id: 3,
        title: "🔄 How They Work Together",
        content: "You use Git locally to track changes, then 'push' your work to GitHub for backup and sharing. Team members 'pull' changes from GitHub to stay synchronized. It's like editing locally and syncing to the cloud.",
        visual: "💻 Local Git ↔️ 🌐 GitHub (push/pull)",
        example: "Write code on your laptop (Git) → Save to GitHub (push) → Teammates download updates (pull) → Everyone stays in sync!",
        tryIt: "GitSarva simulates this entire workflow in your browser safely."
      }
    ],
    3: [
      {
        id: 1,
        title: "📥 Installing Git in the Real World",
        content: "In real life, you'd download Git from git-scm.com and run an installer. It's like installing any other software - click, click, done! Git then runs silently in the background.",
        visual: "🌐 git-scm.com → Download → Install → Ready!",
        example: "Just like installing Chrome or Spotify - visit the official website, download, install. Git adds itself to your system so you can use it from any terminal.",
        tryIt: "Bookmark git-scm.com for when you're ready to install the real Git."
      },
      {
        id: 2,
        title: "⚙️ First-Time Setup (Name & Email)",
        content: "After installing, you tell Git who you are with two simple commands. This is like signing into an app - Git needs to know who is making changes for the history records.",
        visual: "🆔 git config --global user.name 'Your Name'",
        example: "Like setting up your profile in any app, you configure your name and email once. Every change you make will be tagged with this identity.",
        tryIt: "In GitSarva, this is already done for you - but remember these commands for real Git!"
      },
      {
        id: 3,
        title: "🔐 Connecting to GitHub (Authentication)",
        content: "To push code to GitHub, you need to prove you're you. This is like logging into your email - GitHub needs to verify your identity before letting you upload code.",
        visual: "🔑 SSH keys or Personal Access Tokens = Your ID card",
        example: "Just like your house key proves you live there, SSH keys prove you own your GitHub account. You generate a key pair and give GitHub the public key.",
        tryIt: "GitSarva handles this complexity for you - but real Git requires this one-time setup."
      }
    ],
    4: [
      {
        id: 1,
        title: "🚀 Initialize Your First Repository",
        content: "Let's create a Git repository! When you run 'git init', watch what happens to the visualization on the right - it will transform from the 'not initialized' state to show the three Git areas.",
        visual: "💫 git init = Activate Git tracking",
        example: "This is like starting a new project notebook. Once initialized, Git begins watching every change in this folder, ready to track your project's history.",
        tryIt: "Run git init and watch the visualization come alive!",
        command: "git init"
      },
      {
        id: 2,
        title: "👀 Watch the Git Areas Appear",
        content: "After running 'git init', notice how the right panel now shows the three Git workflow areas! The Working Directory should be highlighted since that's where you'll start working.",
        visual: "📊 Working Directory | Staging Area | Repository",
        example: "In real development, this visualization represents your project's current state. Professional developers constantly move files between these three areas.",
        tryIt: "Look at the Git Workflow section - you can now see all three areas are ready for action!"
      },
      {
        id: 3,
        title: "📁 Understanding Your Repository",
        content: "Your folder is now a Git repository! Behind the scenes, Git created a hidden .git folder that stores all the tracking magic. You never need to touch this folder - Git manages it automatically.",
        visual: "🏠 Your Project Folder = Now a Smart Git Repository",
        example: "Like a regular folder that gained superpowers - it looks the same but now remembers every change, who made it, and when. This is the foundation of professional development.",
        tryIt: "Try running 'git status' to see what Git is currently tracking!",
        command: "git status"
      }
    ],
    5: [
      {
        id: 1,
        title: "🏠 See Git's Three Areas in Action",
        content: "Watch the Git Workflow section on the right! It automatically highlights which area is currently active. As you run commands, you'll see the highlighting move between Working Directory → Staging Area → Repository.",
        visual: "👀 Watch the right panel highlight areas as you work",
        example: "Right now, the Working Directory should be highlighted because we haven't added any files yet. As you add files, the highlighting will shift automatically!",
        tryIt: "Look at the Git Workflow visualization - it shows exactly where your files are!",
        command: "git status"
      },
      {
        id: 2,
        title: "💼 Working Directory: Create Some Files",
        content: "Let's see the Working Directory in action! The visualization will show untracked files here. In real projects, this is where you edit code, create new features, and modify existing files.",
        visual: "📁 Working Directory = Your active workspace",
        example: "Professional developers constantly have files in their Working Directory as they code. The key is knowing when to move them to the next stage.",
        tryIt: "Let's create a file and watch it appear in the Working Directory!",
        command: "echo 'Hello Git!' > README.md"
      },
      {
        id: 3,
        title: "🎭 Staging Area: Add Files to Stage",
        content: "Now add your file to the staging area and watch the visualization change! The highlighting should move to the Staging Area, and you'll see your file listed there.",
        visual: "🛒 git add = Move files to staging (watch the highlight!)",
        example: "In teams, developers carefully choose which files to stage. You might fix 3 bugs but want to commit them separately for clear history.",
        tryIt: "Add your README.md to staging and watch the visualization update!",
        command: "git add README.md"
      },
      {
        id: 4,
        title: "🏛️ Repository: Make Your First Commit",
        content: "Time for the final step! Commit your staged files and watch the visualization highlight the Repository area. Your file will move to the committed state.",
        visual: "💾 git commit = Create permanent snapshot",
        example: "This is your project's first milestone! In real development, each commit represents a working feature or bug fix that you can always return to.",
        tryIt: "Commit your changes and see the Repository area light up!",
        command: "git commit -m 'Add README file'"
      }
    ],
    6: [
      {
        id: 1,
        title: "📸 What is a Commit?",
        content: "A commit is like taking a photo of your entire project at a specific moment. Unlike a regular photo, this 'snapshot' remembers every file, every line of code, and includes a note about what changed.",
        visual: "📸 Project Snapshot = Commit (with timestamp & message)",
        example: "Like creating a save point in a video game - you can always return to this exact state later. Professional developers create commits throughout the day as they add features or fix bugs.",
        tryIt: "Think of commits as creating a timeline of your project's evolution."
      },
      {
        id: 2,
        title: "💬 Writing Good Commit Messages",
        content: "Every commit needs a message explaining what changed. Good messages help your future self and teammates understand the project's history. Write them like headlines in a newspaper!",
        visual: "📰 'Add user login feature' (clear & specific)",
        example: "Bad: 'fixed stuff' or 'changes'. Good: 'Add password validation to login form' or 'Fix navigation bug on mobile devices'. Be specific and helpful!",
        tryIt: "Practice writing commit messages that explain the 'what' and 'why' of your changes."
      },
      {
        id: 3,
        title: "🎯 Making Your First Commit",
        content: "Let's create your first commit! First, we'll add files to the staging area, then commit them with a message. This creates a permanent snapshot in your repository's history.",
        visual: "🏠 Working → 🛒 Staging → 💾 Repository",
        example: "Like putting items in a shopping cart (staging) and then checking out (committing). You're in control of what gets saved and when.",
        tryIt: "Ready to create your first commit? Let's add some files and commit them!",
        command: "git add . && git commit -m 'Initial commit'"
      }
    ],
    7: [
      {
        id: 1,
        title: "🧭 Git Status: Your Visual Dashboard",
        content: "Run 'git status' and watch how it matches perfectly with the visualization! The terminal output describes exactly what you see in the Git Workflow areas on the right.",
        visual: "🗺️ Terminal + Visualization = Complete picture",
        example: "Professional developers use git status constantly because it tells them exactly what actions they can take next. It's like having a GPS for your project.",
        tryIt: "Run git status and compare the output with the visualization!",
        command: "git status"
      },
      {
        id: 2,
        title: "🔍 Create Files and Watch Status Change",
        content: "Let's see git status in action! Create a file, then run git status again. Watch both the terminal output AND the visualization update to show your new untracked file.",
        visual: "📋 New file = Shows in Working Directory",
        example: "In real development, you're constantly creating and modifying files. Git status helps you keep track of what's changed and what needs to be committed.",
        tryIt: "Create a file and immediately check the status!",
        command: "echo 'New feature' > feature.txt && git status"
      },
      {
        id: 3,
        title: "⚡ Status + Add + Status Pattern",
        content: "Try this professional workflow: git status → git add → git status. Watch how the visualization highlighting moves from Working Directory to Staging Area!",
        visual: "🔄 Status → Add → Status (watch the areas change!)",
        example: "This is the rhythm of professional development: check status, make changes, check status again. It becomes second nature and prevents mistakes.",
        tryIt: "Practice the status-add-status pattern and watch the visualization!",
        command: "git add feature.txt && git status"
      }
    ],
    8: [
      {
        id: 1,
        title: "🌳 Branches: Parallel Universes for Your Code",
        content: "Imagine you could duplicate your entire project, make changes in the copy, and then choose whether to keep those changes. That's exactly what Git branches do!",
        visual: "🌳 Main branch ➕ Feature branch = Safe experimentation",
        example: "Like making a photocopy of an important document before editing it. You can experiment freely, knowing the original is safe. If you like your changes, you can replace the original.",
        tryIt: "Branches let you try new ideas without risking your working code."
      },
      {
        id: 2,
        title: "🎭 Creating and Switching Branches",
        content: "Creating a branch is like creating a new timeline for your project. You can switch between branches instantly, and each branch remembers its own history and files.",
        visual: "💻 git branch feature-name → git checkout feature-name",
        example: "Like having multiple drafts of an essay - you can work on 'draft-with-humor' while keeping 'formal-draft' safe. Switch between them anytime!",
        tryIt: "Let's create your first branch and see the magic happen!",
        command: "git branch my-feature"
      },
      {
        id: 3,
        title: "🔒 Branch Isolation: Your Safety Net",
        content: "Each branch is completely isolated. Changes in one branch don't affect others until you explicitly merge them. This means you can experiment fearlessly!",
        visual: "🏠 Branch A changes ≠ Branch B changes (until merged)",
        example: "Like having separate rooms in a house - you can redecorate one room without affecting the others. Only when you're happy do you apply changes to the main living space.",
        tryIt: "Professional teams use branches for every feature, bug fix, and experiment. It's the key to safe collaboration!"
      }
    ],
    9: [
      {
        id: 1,
        title: "🤝 Merging: Bringing Changes Together",
        content: "Merging is how you take changes from one branch and integrate them into another. It's like combining two different document drafts into one final version.",
        visual: "🔀 Feature branch → Main branch (merge)",
        example: "Like a team project where everyone worked on different sections, then you combine all sections into the final report. Git intelligently weaves the changes together.",
        tryIt: "Merging is how individual work becomes team work in professional development."
      },
      {
        id: 2,
        title: "⚔️ Merge Conflicts: When Changes Clash",
        content: "Sometimes Git can't automatically merge changes because the same lines were modified differently. This is called a merge conflict - Git asks you to decide which version to keep.",
        visual: "⚠️ Same line, different changes = Conflict (you decide)",
        example: "Like two people editing the same sentence in different ways. Git shows you both versions and asks 'Which one do you want?' or 'Can you combine them?'",
        tryIt: "Don't fear conflicts! They're normal and Git gives you tools to resolve them easily."
      },
      {
        id: 3,
        title: "🔄 Professional Merge Workflow",
        content: "In professional teams, merging often happens through 'Pull Requests' on GitHub. This adds code review - teammates check your changes before they're merged into the main branch.",
        visual: "💻 Your branch → 📋 Pull Request → 👥 Review → ✅ Merge",
        example: "Like submitting an essay for peer review before final submission. Your teammates can suggest improvements, catch bugs, and ensure quality.",
        tryIt: "Code review makes teams stronger and catches problems early. It's collaboration at its best!",
        command: "git merge feature-branch"
      }
    ]
  };
  
  return stepsMap[lessonId] || [];
};

export default function LessonModal({ isOpen, onClose, lesson, onSuggestCommand }: LessonModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  if (!lesson) return null;
  
  const steps = getLessonSteps(lesson.id);
  const hasSteps = steps.length > 0;
  const currentStepData = hasSteps ? steps[currentStep] : null;
  const progressPercentage = hasSteps ? ((currentStep + 1) / steps.length) * 100 : 0;

  const handleNext = () => {
    if (hasSteps && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTryCommand = () => {
    if (currentStepData?.command && onSuggestCommand) {
      onSuggestCommand(currentStepData.command);
      onClose();
    }
  };

  const getDifficultyIcon = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return <span className="text-green-500">🥇</span>;
      case 'intermediate': return <span className="text-yellow-500">🥈</span>;
      case 'advanced': return <span className="text-red-500">🥉</span>;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-3">
              {getDifficultyIcon(lesson.difficulty)}
              <span className="text-xl font-bold text-github-dark dark:text-foreground">
                {lesson.title}
              </span>
              {lesson.difficulty && (
                <Badge variant={lesson.difficulty === 'beginner' ? 'secondary' : 
                               lesson.difficulty === 'intermediate' ? 'default' : 'destructive'}>
                  {lesson.difficulty}
                </Badge>
              )}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {lesson.estimatedMinutes && (
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{lesson.estimatedMinutes} minutes</span>
              </div>
            )}
            {lesson.category && (
              <div className="flex items-center space-x-1">
                <Folder className="h-4 w-4" />
                <span className="capitalize">{lesson.category}</span>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          {hasSteps && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-muted-foreground">
                  {Math.round(progressPercentage)}% Complete
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}

          {/* Learning Objectives */}
          {lesson.learningObjectives && (
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">🎯 What You'll Learn</h3>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {JSON.parse(lesson.learningObjectives).map((objective: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2 text-blue-800 dark:text-blue-200">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          {hasSteps && currentStepData ? (
            <Card className="border-2 border-github-blue/20">
              <CardHeader className="bg-gradient-to-r from-github-blue/5 to-purple-600/5">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-github-blue" />
                  <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-base leading-relaxed text-muted-foreground">
                  {currentStepData.content}
                </p>

                {/* Visual Representation */}
                {currentStepData.visual && (
                  <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800 dark:text-yellow-200">Visual Concept</span>
                      </div>
                      <p className="text-yellow-800 dark:text-yellow-200 font-mono text-center text-lg">
                        {currentStepData.visual}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Real-World Example */}
                {currentStepData.example && (
                  <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Globe className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-200">Real-World Example</span>
                      </div>
                      <p className="text-green-800 dark:text-green-200">
                        {currentStepData.example}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Try It Section */}
                {currentStepData.tryIt && (
                  <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Terminal className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-purple-800 dark:text-purple-200">Try This!</span>
                      </div>
                      <p className="text-purple-800 dark:text-purple-200 mb-3">
                        {currentStepData.tryIt}
                      </p>
                      {currentStepData.command && (
                        <Button 
                          onClick={handleTryCommand}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          size="sm"
                        >
                          <Terminal className="h-4 w-4 mr-2" />
                          Try: {currentStepData.command}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          ) : (
            // Fallback to lesson content if no steps
            <div className="space-y-4">
              <p className="text-lg leading-relaxed">{lesson.content}</p>
              
              {lesson.realWorldContext && (
                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800 dark:text-blue-200">Professional Context</span>
                    </div>
                    <p className="text-blue-800 dark:text-blue-200">
                      {lesson.realWorldContext}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={!hasSteps || currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center space-x-2">
              {hasSteps && (
                <span className="text-sm text-muted-foreground">
                  {currentStep + 1} of {steps.length}
                </span>
              )}
            </div>

            <Button 
              onClick={handleNext}
              className="bg-github-blue hover:bg-github-blue/90 text-white flex items-center space-x-2"
            >
              <span>{hasSteps && currentStep < steps.length - 1 ? 'Next' : 'Complete'}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 