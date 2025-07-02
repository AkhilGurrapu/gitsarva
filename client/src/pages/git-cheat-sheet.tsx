import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Terminal,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  FileText,
  Settings,
  Eye,
  Zap,
  RotateCcw,
  Copy,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/AppHeader";

interface GitCommand {
  command: string;
  description: string;
  syntax: string;
  examples: string[];
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  commonUse: boolean;
  visualization?: string;
  relatedCommands?: string[];
  tips?: string[];
  warning?: string;
}

const gitCommands: GitCommand[] = [
  // ==================== REPOSITORY SETUP ====================
  {
    command: "git init",
    description: "Start tracking a project with Git - creates a new Git repository",
    syntax: "git init [directory-name]",
    examples: [
      "git init",
      "git init my-awesome-project",
      "git init --bare shared-repo.git"
    ],
    category: "Repository Setup",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Creates a hidden .git folder that stores all your project's history and configuration",
    tips: [
      "This only sets up tracking locally - no files are committed yet",
      "Use 'git init --bare' for repositories that will be shared/pushed to",
      "You can safely run this in any directory to start Git tracking"
    ],
    relatedCommands: ["git clone", "git add", "git commit"]
  },
  {
    command: "git clone",
    description: "Download a complete copy of a remote repository to your computer",
    syntax: "git clone <repository-url> [local-directory-name]",
    examples: [
      "git clone https://github.com/user/awesome-project.git",
      "git clone git@github.com:user/project.git my-local-folder",
      "git clone --depth 1 https://github.com/user/big-project.git",
      "git clone --branch develop https://github.com/user/project.git"
    ],
    category: "Repository Setup",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Downloads the entire project history, branches, and files from a remote server",
    tips: [
      "Automatically creates a folder with the project name if you don't specify one",
      "Sets up 'origin' as the default remote connection to the original repository",
      "Use --depth 1 for large projects to only get the latest version (shallow clone)",
      "Use --branch to clone a specific branch instead of the default"
    ],
    relatedCommands: ["git remote", "git pull", "git push", "git fetch"]
  },
  {
    command: "git remote",
    description: "Manage connections to other repositories (like GitHub, GitLab)",
    syntax: "git remote [subcommand] [options]",
    examples: [
      "git remote -v",
      "git remote add origin https://github.com/user/project.git",
      "git remote add upstream https://github.com/original/project.git",
      "git remote remove old-server",
      "git remote rename origin my-server"
    ],
    category: "Repository Setup",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Manages the 'address book' of remote repositories you can sync with",
    tips: [
      "'origin' is the conventional name for your main remote repository",
      "'upstream' typically refers to the original repo when you've forked it",
      "Use -v (verbose) to see the actual URLs of your remotes"
    ],
    relatedCommands: ["git clone", "git push", "git pull", "git fetch"]
  },

  // ==================== BASIC WORKFLOW ====================
  {
    command: "git add",
    description: "Stage files for commit - tell Git which changes you want to save",
    syntax: "git add <file-or-pattern>",
    examples: [
      "git add README.md",
      "git add .",
      "git add src/",
      "git add *.js",
      "git add -A",
      "git add -p"
    ],
    category: "Basic Workflow",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Moves files from 'Working Directory' to 'Staging Area' - like packing items for shipping",
    tips: [
      "'.' adds all changes in the current directory and subdirectories",
      "'-A' adds all changes including deleted files throughout the entire repository",
      "'-p' lets you choose specific parts of files to stage (interactive mode)",
      "You can add multiple files at once: git add file1.txt file2.txt"
    ],
    relatedCommands: ["git status", "git commit", "git reset", "git diff"]
  },
  {
    command: "git commit",
    description: "Save your staged changes as a permanent snapshot in Git history",
    syntax: "git commit -m \"your message here\"",
    examples: [
      "git commit -m \"Add user login feature\"",
      "git commit -m \"Fix homepage loading bug\"",
      "git commit -am \"Quick fix for typo\"",
      "git commit --amend -m \"Better commit message\"",
      "git commit --no-verify -m \"Skip pre-commit hooks\""
    ],
    category: "Basic Workflow",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Creates a permanent snapshot that you can return to anytime - like saving your game",
    tips: [
      "Write clear messages that explain what you changed and why",
      "Use -a to automatically stage tracked files before committing",
      "Use --amend to modify your last commit (before pushing!)",
      "Good format: 'Add feature' or 'Fix issue' rather than 'Added' or 'Fixed'"
    ],
    relatedCommands: ["git add", "git log", "git push", "git reset"],
    warning: "Never amend commits that have already been pushed to shared repositories"
  },
  {
    command: "git status",
    description: "See what's happening in your repository right now",
    syntax: "git status [options]",
    examples: [
      "git status",
      "git status -s",
      "git status --porcelain",
      "git status --ignored"
    ],
    category: "Basic Workflow",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Shows the current state of your Working Directory, Staging Area, and any unpushed commits",
    tips: [
      "Use this command frequently to understand what Git sees",
      "Red files = changed but not staged, Green files = staged and ready to commit",
      "-s gives a compact view that's easier to scan",
      "Shows which branch you're on and if you're ahead/behind the remote"
    ],
    relatedCommands: ["git add", "git commit", "git diff", "git log"]
  },
  {
    command: "git diff",
    description: "See exactly what changed in your files",
    syntax: "git diff [options] [files]",
    examples: [
      "git diff",
      "git diff --staged",
      "git diff HEAD~1",
      "git diff main feature-branch",
      "git diff --name-only",
      "git diff README.md"
    ],
    category: "Basic Workflow",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Shows line-by-line differences with additions in green (+) and deletions in red (-)",
    tips: [
      "With no arguments, shows unstaged changes",
      "--staged shows what's about to be committed",
      "--name-only just lists changed files without showing the actual changes",
      "Use it before committing to review your changes"
    ],
    relatedCommands: ["git add", "git status", "git log", "git show"]
  },

  // ==================== BRANCHING & MERGING ====================
  {
    command: "git branch",
    description: "Create, list, or delete branches - parallel versions of your project",
    syntax: "git branch [options] [branch-name]",
    examples: [
      "git branch",
      "git branch feature-login",
      "git branch -d completed-feature",
      "git branch -D unwanted-branch",
      "git branch -a",
      "git branch -r"
    ],
    category: "Branching",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Creates separate timelines where you can work on features without affecting the main code",
    tips: [
      "With no arguments, lists all local branches (* shows current branch)",
      "-a shows all branches (local and remote), -r shows only remote branches",
      "-d safely deletes merged branches, -D force deletes any branch",
      "Name branches descriptively: feature/user-auth, bugfix/header-overflow"
    ],
    relatedCommands: ["git checkout", "git switch", "git merge", "git push"]
  },
  {
    command: "git checkout",
    description: "Switch between branches or restore files from Git history",
    syntax: "git checkout <branch-or-commit> [file]",
    examples: [
      "git checkout main",
      "git checkout -b new-feature",
      "git checkout feature/login",
      "git checkout HEAD~2",
      "git checkout -- README.md",
      "git checkout main -- config.js"
    ],
    category: "Branching",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Updates your working directory to match a different branch or point in time",
    tips: [
      "-b creates a new branch and switches to it immediately",
      "-- restores files from the current branch's latest commit",
      "You can checkout specific files from other branches or commits",
      "Creates 'detached HEAD' when checking out specific commits"
    ],
    relatedCommands: ["git branch", "git switch", "git merge", "git reset"],
    warning: "Switching branches with uncommitted changes may cause conflicts"
  },
  {
    command: "git switch",
    description: "Modern, safer way to switch between branches (Git 2.23+)",
    syntax: "git switch <branch-name>",
    examples: [
      "git switch main",
      "git switch -c new-feature",
      "git switch feature/login",
      "git switch -"
    ],
    category: "Branching",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Changes your current working branch - clearer than checkout for branch switching",
    tips: [
      "-c creates and switches to a new branch (like checkout -b)",
      "Use '-' to switch to the previously active branch",
      "Designed specifically for branch switching (checkout does many things)",
      "Prevents accidental file restoration that can happen with checkout"
    ],
    relatedCommands: ["git branch", "git checkout", "git merge"]
  },
  {
    command: "git merge",
    description: "Combine changes from one branch into another",
    syntax: "git merge <branch-name>",
    examples: [
      "git merge feature/login",
      "git merge --no-ff feature-branch",
      "git merge --squash experimental",
      "git merge --abort"
    ],
    category: "Branching",
    difficulty: "intermediate",
    commonUse: true,
    visualization: "Combines the commit history of two branches, creating a merge point",
    tips: [
      "Always merge INTO the branch you want to update (switch to main, then merge feature)",
      "--no-ff creates a merge commit even for fast-forward merges",
      "--squash combines all commits from the other branch into one",
      "Use --abort if merge conflicts are too complex to resolve"
    ],
    relatedCommands: ["git branch", "git checkout", "git rebase", "git log"],
    warning: "May create merge conflicts that need manual resolution"
  },

  // ==================== REMOTE OPERATIONS ====================
  {
    command: "git push",
    description: "Upload your local commits to a remote repository",
    syntax: "git push [remote] [branch]",
    examples: [
      "git push",
      "git push origin main",
      "git push -u origin feature-branch",
      "git push --force-with-lease",
      "git push --tags",
      "git push origin --delete old-branch"
    ],
    category: "Remote Operations",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Sends your local commits to the remote repository for others to see",
    tips: [
      "-u sets upstream tracking so future pushes/pulls work without specifying remote/branch",
      "--force-with-lease is safer than --force (won't overwrite others' work)",
      "--tags pushes your local tags to the remote",
      "Push after each completed feature or at the end of your work session"
    ],
    relatedCommands: ["git pull", "git fetch", "git commit", "git remote"],
    warning: "Always pull latest changes before pushing to avoid conflicts"
  },
  {
    command: "git pull",
    description: "Download and merge the latest changes from a remote repository",
    syntax: "git pull [remote] [branch]",
    examples: [
      "git pull",
      "git pull origin main",
      "git pull --rebase",
      "git pull --no-rebase",
      "git pull upstream main"
    ],
    category: "Remote Operations",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Combines 'git fetch' and 'git merge' - downloads changes and integrates them",
    tips: [
      "Run this regularly to stay in sync with team changes",
      "--rebase applies your commits on top of the pulled changes (cleaner history)",
      "Always pull before starting new work and before pushing",
      "Resolves conflicts the same way as merge"
    ],
    relatedCommands: ["git fetch", "git merge", "git push", "git rebase"]
  },
  {
    command: "git fetch",
    description: "Download changes from remote repository without merging them",
    syntax: "git fetch [remote] [branch]",
    examples: [
      "git fetch",
      "git fetch origin",
      "git fetch --all",
      "git fetch --prune",
      "git fetch upstream main"
    ],
    category: "Remote Operations",
    difficulty: "intermediate",
    commonUse: true,
    visualization: "Downloads remote changes but doesn't change your working files - safe preview",
    tips: [
      "Safer than pull because you can review changes before merging",
      "--all fetches from all configured remotes",
      "--prune removes remote branches that have been deleted",
      "Follow with 'git log origin/main' to see what was downloaded"
    ],
    relatedCommands: ["git pull", "git merge", "git log", "git diff"]
  },

  // ==================== HISTORY & INFORMATION ====================
  {
    command: "git log",
    description: "View the history of commits in your repository",
    syntax: "git log [options] [branch]",
    examples: [
      "git log",
      "git log --oneline",
      "git log --graph --all",
      "git log --since='2 weeks ago'",
      "git log --author='John Doe'",
      "git log -p README.md"
    ],
    category: "History & Information",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Shows a chronological list of commits with messages, authors, and dates",
    tips: [
      "--oneline shows each commit on a single line (great for quick overview)",
      "--graph visualizes branch structure with ASCII art",
      "Use --since and --until for date ranges",
      "-p shows the actual changes made in each commit"
    ],
    relatedCommands: ["git show", "git diff", "git blame", "git reflog"]
  },
  {
    command: "git show",
    description: "Display detailed information about a specific commit",
    syntax: "git show [commit-hash]",
    examples: [
      "git show",
      "git show HEAD~1",
      "git show abc123f",
      "git show main:README.md",
      "git show --name-only HEAD"
    ],
    category: "History & Information",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Shows the commit message, author, date, and all changes made in that commit",
    tips: [
      "With no arguments, shows the most recent commit",
      "Use commit hashes (first 7 characters usually work)",
      "HEAD~1 means 'one commit before the current one'",
      "--name-only just shows which files were changed"
    ],
    relatedCommands: ["git log", "git diff", "git commit"]
  },
  {
    command: "git blame",
    description: "See who last modified each line of a file",
    syntax: "git blame <file>",
    examples: [
      "git blame README.md",
      "git blame -L 10,20 app.js",
      "git blame --porcelain config.py"
    ],
    category: "History & Information",
    difficulty: "intermediate",
    commonUse: false,
    visualization: "Annotates each line with the commit hash, author, and date of the last change",
    tips: [
      "Great for understanding why code was written a certain way",
      "-L lets you focus on specific line ranges",
      "Use it to find the right person to ask about confusing code",
      "Not about blaming - it's about understanding context!"
    ],
    relatedCommands: ["git log", "git show", "git annotate"]
  },

  // ==================== UNDOING CHANGES ====================
  {
    command: "git reset",
    description: "Undo commits or unstage files (use carefully!)",
    syntax: "git reset [mode] [commit]",
    examples: [
      "git reset HEAD~1",
      "git reset --soft HEAD~1",
      "git reset --hard HEAD~1",
      "git reset README.md",
      "git reset --mixed origin/main"
    ],
    category: "Undoing Changes",
    difficulty: "intermediate",
    commonUse: true,
    visualization: "Moves the branch pointer to a different commit, optionally changing staging area and working directory",
    tips: [
      "--soft: undo commit but keep changes staged",
      "--mixed (default): undo commit and unstage changes",
      "--hard: undo commit and delete changes (dangerous!)",
      "Use file names to unstage specific files"
    ],
    relatedCommands: ["git revert", "git checkout", "git reflog"],
    warning: "Never reset commits that have been pushed to shared repositories"
  },
  {
    command: "git revert",
    description: "Create a new commit that undoes changes from a previous commit",
    syntax: "git revert <commit-hash>",
    examples: [
      "git revert HEAD",
      "git revert abc123f",
      "git revert --no-commit HEAD~3..HEAD",
      "git revert -m 1 merge-commit-hash"
    ],
    category: "Undoing Changes",
    difficulty: "intermediate",
    commonUse: true,
    visualization: "Creates a new commit that applies the opposite changes of the specified commit",
    tips: [
      "Safe for public/shared repositories (doesn't change history)",
      "Creates a new commit rather than deleting the old one",
      "--no-commit lets you revert multiple commits before committing",
      "Use -m 1 for merge commits to specify which parent to revert to"
    ],
    relatedCommands: ["git reset", "git log", "git show"]
  },
  {
    command: "git restore",
    description: "Restore files to a previous state (modern alternative to checkout)",
    syntax: "git restore [options] <file>",
    examples: [
      "git restore README.md",
      "git restore --staged config.js",
      "git restore --source=HEAD~1 app.py",
      "git restore ."
    ],
    category: "Undoing Changes",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Restores files from a specific commit or removes them from staging area",
    tips: [
      "Replaces the confusing aspects of 'git checkout' for file operations",
      "--staged unstages files (removes from staging area)",
      "--source specifies which commit to restore from",
      ". restores all files in current directory"
    ],
    relatedCommands: ["git checkout", "git reset", "git add"]
  },

  // ==================== STASHING ====================
  {
    command: "git stash",
    description: "Temporarily save uncommitted changes without committing",
    syntax: "git stash [subcommand] [options]",
    examples: [
      "git stash",
      "git stash push -m \"Work in progress on login\"",
      "git stash pop",
      "git stash list",
      "git stash apply stash@{1}",
      "git stash drop stash@{0}"
    ],
    category: "Stashing",
    difficulty: "intermediate",
    commonUse: true,
    visualization: "Saves your uncommitted work in a temporary area so you can switch branches or pull updates",
    tips: [
      "'git stash' is shorthand for 'git stash push'",
      "'pop' applies the stash and removes it from the stash list",
      "'apply' applies the stash but keeps it in the list",
      "Use meaningful messages with -m to remember what you stashed"
    ],
    relatedCommands: ["git checkout", "git pull", "git commit"]
  },
  {
    command: "git stash list",
    description: "Show all your saved stashes",
    syntax: "git stash list",
    examples: [
      "git stash list",
      "git stash list --oneline"
    ],
    category: "Stashing",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Lists all temporarily saved work with timestamps and messages",
    tips: [
      "Shows stashes as stash@{0}, stash@{1}, etc. (most recent first)",
      "Each stash includes the branch it was created on",
      "Use this before applying stashes to see what you have saved"
    ],
    relatedCommands: ["git stash", "git stash show", "git stash apply"]
  },

  // ==================== ADVANCED OPERATIONS ====================
  {
    command: "git rebase",
    description: "Replay commits on top of another branch for a cleaner history",
    syntax: "git rebase [branch]",
    examples: [
      "git rebase main",
      "git rebase -i HEAD~3",
      "git rebase --abort",
      "git rebase --continue",
      "git rebase --onto main feature~5 feature"
    ],
    category: "Advanced Operations",
    difficulty: "advanced",
    commonUse: false,
    visualization: "Moves your commits to the tip of another branch, rewriting commit history",
    tips: [
      "-i (interactive) lets you edit, squash, or reorder commits",
      "Use instead of merge for a linear, cleaner project history",
      "--abort cancels the rebase if things go wrong",
      "Always rebase feature branches onto main, not the other way around"
    ],
    relatedCommands: ["git merge", "git commit", "git log"],
    warning: "Never rebase commits that have been pushed to shared repositories"
  },
  {
    command: "git cherry-pick",
    description: "Apply specific commits from one branch to another",
    syntax: "git cherry-pick <commit-hash>",
    examples: [
      "git cherry-pick abc123f",
      "git cherry-pick feature~2",
      "git cherry-pick --no-commit abc123f def456g",
      "git cherry-pick -x abc123f"
    ],
    category: "Advanced Operations",
    difficulty: "advanced",
    commonUse: false,
    visualization: "Copies a specific commit from anywhere in your Git history to your current branch",
    tips: [
      "Great for applying hotfixes to multiple branches",
      "--no-commit applies changes without committing (lets you modify first)",
      "-x adds a reference to the original commit in the message",
      "You can cherry-pick multiple commits at once"
    ],
    relatedCommands: ["git rebase", "git merge", "git log"]
  },

  // ==================== CONFIGURATION ====================
  {
    command: "git config",
    description: "Set up Git with your personal information and preferences",
    syntax: "git config [--global] <key> <value>",
    examples: [
      "git config --global user.name \"Your Name\"",
      "git config --global user.email \"you@example.com\"",
      "git config --list",
      "git config core.editor \"code --wait\"",
      "git config --global init.defaultBranch main"
    ],
    category: "Configuration",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Sets up your Git identity and customizes how Git behaves",
    tips: [
      "--global applies settings to all repositories on your computer",
      "Without --global, settings only apply to the current repository",
      "Set user.name and user.email before making your first commit",
      "--list shows all current configuration settings"
    ],
    relatedCommands: ["git init", "git commit"]
  },

  // ==================== TAGS ====================
  {
    command: "git tag",
    description: "Mark specific points in history as important (like releases)",
    syntax: "git tag [tag-name] [commit]",
    examples: [
      "git tag v1.0.0",
      "git tag -a v1.0.0 -m \"First release\"",
      "git tag -l \"v1.*\"",
      "git tag -d v0.9.0",
      "git push --tags"
    ],
    category: "Tags",
    difficulty: "intermediate",
    commonUse: false,
    visualization: "Creates permanent labels for specific commits, typically used for version releases",
    tips: [
      "-a creates annotated tags with metadata (recommended for releases)",
      "-l lists existing tags, supports pattern matching",
      "Tags aren't pushed by default - use 'git push --tags'",
      "Use semantic versioning: v1.0.0, v1.1.0, v2.0.0"
    ],
    relatedCommands: ["git push", "git log", "git show"]
  },

  // ==================== FILE OPERATIONS ====================
  {
    command: "git rm",
    description: "Remove files from Git tracking and optionally from your filesystem",
    syntax: "git rm <file>",
    examples: [
      "git rm old-file.txt",
      "git rm --cached secret.key",
      "git rm -r old-directory/",
      "git rm '*.log'"
    ],
    category: "File Operations",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Stages the removal of files - they'll be deleted when you commit",
    tips: [
      "--cached removes from Git but keeps the file on your computer",
      "-r removes directories recursively",
      "Use quotes around wildcards to prevent shell expansion",
      "Follow with a commit to finalize the removal"
    ],
    relatedCommands: ["git add", "git commit", "git status"]
  },
  {
    command: "git mv",
    description: "Move or rename files while keeping Git history",
    syntax: "git mv <old-name> <new-name>",
    examples: [
      "git mv old-name.txt new-name.txt",
      "git mv src/app.js src/main.js",
      "git mv old-folder/ new-folder/"
    ],
    category: "File Operations",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Renames or moves files while preserving their Git history",
    tips: [
      "Better than manually deleting and adding files (preserves history)",
      "Git can usually detect renames even if you don't use this command",
      "Works for both files and directories",
      "Remember to commit after moving files"
    ],
    relatedCommands: ["git add", "git rm", "git status"]
  },

  // ==================== SUBMODULES ====================
  {
    command: "git submodule",
    description: "Include other Git repositories inside your repository",
    syntax: "git submodule <subcommand> [options]",
    examples: [
      "git submodule add https://github.com/user/library.git lib",
      "git submodule init",
      "git submodule update",
      "git submodule update --remote"
    ],
    category: "Submodules",
    difficulty: "advanced",
    commonUse: false,
    visualization: "Links external repositories as subdirectories within your project",
    tips: [
      "Useful for including libraries or shared code",
      "'init' and 'update' are needed when cloning repositories with submodules",
      "--remote updates submodules to their latest commits",
      "Consider alternatives like package managers for dependencies"
    ],
    relatedCommands: ["git clone", "git pull"]
  },

  // ==================== DEBUGGING ====================
  {
    command: "git bisect",
    description: "Find the commit that introduced a bug using binary search",
    syntax: "git bisect <subcommand>",
    examples: [
      "git bisect start",
      "git bisect bad",
      "git bisect good v1.0",
      "git bisect reset"
    ],
    category: "Debugging",
    difficulty: "advanced",
    commonUse: false,
    visualization: "Automatically tests commits to find when a bug was introduced",
    tips: [
      "Mark current commit as 'bad' and a known good commit",
      "Git will check out commits for you to test",
      "Keep marking commits as 'good' or 'bad' until the culprit is found",
      "Use 'reset' to return to your original branch when done"
    ],
    relatedCommands: ["git log", "git show", "git checkout"]
  },
  {
    command: "git grep",
    description: "Search for text patterns across all files in your Git repository",
    syntax: "git grep <pattern> [files]",
    examples: [
      "git grep \"function\"",
      "git grep -n \"TODO\"",
      "git grep --count \"import\"",
      "git grep \"bug\" HEAD~5"
    ],
    category: "Debugging",
    difficulty: "intermediate",
    commonUse: false,
    visualization: "Searches through all tracked files for specific text patterns",
    tips: [
      "-n shows line numbers where matches are found",
      "--count shows how many matches per file",
      "Can search in specific commits by adding the commit hash",
      "Faster than regular grep because it only searches tracked files"
    ],
    relatedCommands: ["git log", "git show", "git blame"]
  },

  // ==================== HOOKS & AUTOMATION ====================
  {
    command: "git hook",
    description: "Automate actions when specific Git events occur",
    syntax: "git hook <hook-name>",
    examples: [
      "git hook pre-commit",
      "git hook post-receive",
      "git hook pre-push"
    ],
    category: "Hooks",
    difficulty: "advanced",
    commonUse: false,
    visualization: "Triggers custom scripts automatically during Git operations",
    tips: [
      "Hooks are scripts stored in .git/hooks/",
      "pre-commit hooks run before each commit",
      "Use for automated testing, code formatting, or validation",
      "Make hooks executable with chmod +x"
    ],
    relatedCommands: ["git commit", "git push"]
  },

  // ==================== MAINTENANCE ====================
  {
    command: "git gc",
    description: "Clean up and optimize your Git repository",
    syntax: "git gc [options]",
    examples: [
      "git gc",
      "git gc --aggressive",
      "git gc --prune=now"
    ],
    category: "Maintenance",
    difficulty: "intermediate",
    commonUse: false,
    visualization: "Removes unnecessary files and optimizes repository performance",
    tips: [
      "Git runs this automatically, but manual runs can help large repositories",
      "--aggressive does more thorough optimization (slower)",
      "--prune removes objects that are no longer referenced",
      "Good to run after major operations like rebasing"
    ],
    relatedCommands: ["git prune", "git reflog"]
  },
  {
    command: "git fsck",
    description: "Check the integrity of your Git repository",
    syntax: "git fsck [options]",
    examples: [
      "git fsck",
      "git fsck --full",
      "git fsck --dangling"
    ],
    category: "Maintenance",
    difficulty: "advanced",
    commonUse: false,
    visualization: "Verifies that all objects in your repository are valid and properly connected",
    tips: [
      "Use when you suspect repository corruption",
      "--full does more thorough checking",
      "--dangling shows objects not reachable from any reference",
      "Usually not needed unless you have problems"
    ],
    relatedCommands: ["git gc", "git reflog"]
  },

  // ==================== WORKTREES ====================
  {
    command: "git worktree",
    description: "Work on multiple branches simultaneously in separate directories",
    syntax: "git worktree <subcommand> [options]",
    examples: [
      "git worktree add ../feature-branch feature",
      "git worktree list",
      "git worktree remove ../old-feature"
    ],
    category: "Worktrees",
    difficulty: "advanced",
    commonUse: false,
    visualization: "Creates additional working directories linked to the same repository",
    tips: [
      "Useful when you need to work on multiple features simultaneously",
      "Each worktree can have a different branch checked out",
      "Shares the same .git directory but separate working files",
      "Great for comparing branches side-by-side"
    ],
    relatedCommands: ["git branch", "git checkout"]
  },

  // ==================== PATCHES ====================
  {
    command: "git format-patch",
    description: "Create patch files from commits for sharing via email",
    syntax: "git format-patch [options] <range>",
    examples: [
      "git format-patch -1 HEAD",
      "git format-patch HEAD~3..HEAD",
      "git format-patch --stdout HEAD~1 > my-patch.patch"
    ],
    category: "Patches",
    difficulty: "advanced",
    commonUse: false,
    visualization: "Exports commits as patch files that can be applied to other repositories",
    tips: [
      "-1 creates a patch for just the latest commit",
      "Useful for contributing to projects that don't use pull requests",
      "--stdout outputs to terminal instead of files",
      "Include commit messages and author information"
    ],
    relatedCommands: ["git apply", "git am"]
  },
  {
    command: "git apply",
    description: "Apply patch files to your working directory",
    syntax: "git apply <patch-file>",
    examples: [
      "git apply my-patch.patch",
      "git apply --check my-patch.patch",
      "git apply --reverse my-patch.patch"
    ],
    category: "Patches",
    difficulty: "advanced",
    commonUse: false,
    visualization: "Applies changes from patch files to your current working directory",
    tips: [
      "--check verifies if the patch can be applied without actually applying it",
      "--reverse undoes a previously applied patch",
      "Does not create commits - you need to add and commit manually",
      "Use 'git am' for patches with commit information"
    ],
    relatedCommands: ["git format-patch", "git am", "git add"]
  },

  // ==================== MORE BASIC WORKFLOW ====================
  {
    command: "git add -u",
    description: "Stage all modified files that are already tracked by Git",
    syntax: "git add -u [path]",
    examples: [
      "git add -u",
      "git add -u src/",
      "git add -u ."
    ],
    category: "Basic Workflow",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Updates the staging area with changes to tracked files, ignoring new files",
    tips: [
      "Only stages files that Git is already tracking",
      "Won't add new untracked files (unlike 'git add .')",
      "Great for when you've modified many existing files"
    ],
    relatedCommands: ["git add", "git add -A", "git status"]
  },
  {
    command: "git add -A",
    description: "Stage all changes in the entire repository (tracked and untracked)",
    syntax: "git add -A",
    examples: [
      "git add -A",
      "git add --all"
    ],
    category: "Basic Workflow",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Stages everything: new files, modified files, and deleted files throughout the entire repository",
    tips: [
      "More comprehensive than 'git add .' which only works in current directory",
      "Includes deleted files in the staging area",
      "Use when you want to stage absolutely everything"
    ],
    relatedCommands: ["git add", "git add -u", "git status"]
  },
  {
    command: "git commit --amend",
    description: "Modify the last commit instead of creating a new one",
    syntax: "git commit --amend [options]",
    examples: [
      "git commit --amend",
      "git commit --amend -m \"Better commit message\"",
      "git commit --amend --no-edit"
    ],
    category: "Basic Workflow",
    difficulty: "intermediate",
    commonUse: true,
    visualization: "Replaces the last commit with a new one that includes your current staged changes",
    tips: [
      "--no-edit keeps the existing commit message",
      "Great for fixing typos in commit messages or adding forgotten files",
      "Changes the commit hash, so the commit becomes 'new'"
    ],
    relatedCommands: ["git commit", "git reset", "git rebase"],
    warning: "Never amend commits that have been pushed to shared repositories"
  },

  // ==================== MORE BRANCHING ====================
  {
    command: "git switch -c",
    description: "Create a new branch and switch to it immediately",
    syntax: "git switch -c <new-branch-name> [start-point]",
    examples: [
      "git switch -c feature/new-login",
      "git switch -c bugfix/header-issue",
      "git switch -c experiment main"
    ],
    category: "Branching",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Creates a new branch starting from the current commit and switches to it",
    tips: [
      "Modern alternative to 'git checkout -b'",
      "More intuitive and less error-prone than checkout",
      "Can specify a starting point (branch or commit)"
    ],
    relatedCommands: ["git branch", "git switch", "git checkout"]
  },
  {
    command: "git branch -m",
    description: "Rename a branch",
    syntax: "git branch -m [old-name] <new-name>",
    examples: [
      "git branch -m new-feature-name",
      "git branch -m old-name new-name",
      "git branch -m feature/login feature/user-authentication"
    ],
    category: "Branching",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Changes the name of a branch without affecting its history",
    tips: [
      "If you're on the branch, you can omit the old name",
      "Use descriptive names: feature/user-auth, bugfix/memory-leak",
      "Remember to update remote tracking branches if already pushed"
    ],
    relatedCommands: ["git branch", "git push", "git switch"]
  },
  {
    command: "git merge --no-ff",
    description: "Force create a merge commit even for fast-forward merges",
    syntax: "git merge --no-ff <branch>",
    examples: [
      "git merge --no-ff feature/login",
      "git merge --no-ff --no-commit experimental"
    ],
    category: "Branching",
    difficulty: "intermediate",
    commonUse: true,
    visualization: "Always creates a merge commit to preserve branch history",
    tips: [
      "Maintains clear feature branch history in your commit graph",
      "Makes it easier to see when features were integrated",
      "Useful for tracking which commits belong to which feature"
    ],
    relatedCommands: ["git merge", "git log", "git revert"]
  },

  // ==================== MORE REMOTE OPERATIONS ====================
  {
    command: "git push -u",
    description: "Push and set up tracking relationship with remote branch",
    syntax: "git push -u <remote> <branch>",
    examples: [
      "git push -u origin main",
      "git push -u origin feature/new-ui",
      "git push --set-upstream origin bugfix/typo"
    ],
    category: "Remote Operations",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Pushes your branch and sets it up so future push/pull commands work without specifying remote",
    tips: [
      "Only needed the first time you push a new branch",
      "After this, you can just use 'git push' and 'git pull'",
      "--set-upstream is the long form of -u"
    ],
    relatedCommands: ["git push", "git pull", "git branch"]
  },
  {
    command: "git pull --rebase",
    description: "Pull remote changes and replay your commits on top",
    syntax: "git pull --rebase [remote] [branch]",
    examples: [
      "git pull --rebase",
      "git pull --rebase origin main",
      "git pull --rebase upstream main"
    ],
    category: "Remote Operations",
    difficulty: "intermediate",
    commonUse: true,
    visualization: "Downloads remote changes and puts your local commits on top, creating a linear history",
    tips: [
      "Avoids messy merge commits in your history",
      "Makes project history cleaner and easier to follow",
      "May require resolving conflicts during rebase"
    ],
    relatedCommands: ["git pull", "git rebase", "git push"]
  },
  {
    command: "git push --force-with-lease",
    description: "Safely force push only if no one else has pushed",
    syntax: "git push --force-with-lease [remote] [branch]",
    examples: [
      "git push --force-with-lease",
      "git push --force-with-lease origin feature-branch"
    ],
    category: "Remote Operations",
    difficulty: "intermediate",
    commonUse: false,
    visualization: "Force pushes only if the remote hasn't changed since your last fetch",
    tips: [
      "Safer than --force because it checks for other people's work",
      "Use after rebasing or amending commits",
      "Won't overwrite commits from other team members"
    ],
    relatedCommands: ["git push", "git rebase", "git fetch"],
    warning: "Only use when you need to rewrite history that you've already pushed"
  },

  // ==================== MORE HISTORY & INFORMATION ====================
  {
    command: "git log --oneline",
    description: "Show commit history in a compact, one-line-per-commit format",
    syntax: "git log --oneline [options]",
    examples: [
      "git log --oneline",
      "git log --oneline -10",
      "git log --oneline --graph"
    ],
    category: "History & Information",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Displays abbreviated commit hashes and messages in a compact list",
    tips: [
      "Perfect for getting a quick overview of recent changes",
      "Combine with -n to limit number of commits shown",
      "Add --graph to see branch structure"
    ],
    relatedCommands: ["git log", "git show", "git log --graph"]
  },
  {
    command: "git log --graph",
    description: "Show commit history with ASCII art branch visualization",
    syntax: "git log --graph [options]",
    examples: [
      "git log --graph --oneline",
      "git log --graph --all",
      "git log --graph --oneline --decorate"
    ],
    category: "History & Information",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Draws branch and merge patterns using ASCII characters",
    tips: [
      "Great for understanding branch structure and merges",
      "Combine with --all to see all branches",
      "--decorate shows branch and tag names"
    ],
    relatedCommands: ["git log", "git log --oneline", "git branch"]
  },
  {
    command: "git show HEAD~1",
    description: "Show details of a commit relative to the current one",
    syntax: "git show HEAD~<number>",
    examples: [
      "git show HEAD~1",
      "git show HEAD~3",
      "git show HEAD^^"
    ],
    category: "History & Information",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Shows commit information and changes for commits before the current one",
    tips: [
      "HEAD~1 means 'one commit before current', HEAD~2 means 'two before', etc.",
      "HEAD^^ is equivalent to HEAD~2",
      "Use to review recent changes without commit hashes"
    ],
    relatedCommands: ["git show", "git log", "git diff"]
  },

  // ==================== MORE UNDOING CHANGES ====================
  {
    command: "git reset --soft",
    description: "Undo commits but keep changes staged",
    syntax: "git reset --soft <commit>",
    examples: [
      "git reset --soft HEAD~1",
      "git reset --soft HEAD~3",
      "git reset --soft abc123f"
    ],
    category: "Undoing Changes",
    difficulty: "intermediate",
    commonUse: true,
    visualization: "Moves branch pointer back but leaves staging area and working directory unchanged",
    tips: [
      "Perfect for combining multiple commits into one",
      "Changes remain staged and ready to commit",
      "Least destructive form of reset"
    ],
    relatedCommands: ["git reset", "git commit", "git rebase"]
  },
  {
    command: "git reset --hard",
    description: "Undo commits and discard all changes",
    syntax: "git reset --hard <commit>",
    examples: [
      "git reset --hard HEAD~1",
      "git reset --hard origin/main",
      "git reset --hard abc123f"
    ],
    category: "Undoing Changes",
    difficulty: "intermediate",
    commonUse: false,
    visualization: "Moves branch pointer back and discards all changes in staging and working directory",
    tips: [
      "Completely removes commits and all associated changes",
      "Cannot be undone easily - use with extreme caution",
      "Useful for completely abandoning experimental work"
    ],
    relatedCommands: ["git reset", "git reflog", "git clean"],
    warning: "This permanently deletes uncommitted changes - they cannot be recovered"
  },
  {
    command: "git clean",
    description: "Remove untracked files from working directory",
    syntax: "git clean [options]",
    examples: [
      "git clean -f",
      "git clean -fd",
      "git clean -n",
      "git clean -i"
    ],
    category: "Undoing Changes",
    difficulty: "intermediate",
    commonUse: false,
    visualization: "Deletes files that Git isn't tracking",
    tips: [
      "-f (force) is required to actually delete files",
      "-d also removes empty directories",
      "-n shows what would be deleted without doing it",
      "-i interactive mode lets you choose what to delete"
    ],
    relatedCommands: ["git status", "git add", "git reset"],
    warning: "Permanently deletes files - they cannot be recovered"
  },

  // ==================== DETAILED STASHING ====================
  {
    command: "git stash pop",
    description: "Apply the most recent stash and remove it from stash list",
    syntax: "git stash pop [stash]",
    examples: [
      "git stash pop",
      "git stash pop stash@{1}",
      "git stash pop --index"
    ],
    category: "Stashing",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Applies stashed changes to working directory and removes the stash",
    tips: [
      "Default applies the most recent stash (stash@{0})",
      "--index also restores staged changes",
      "If conflicts occur, stash is not removed from list"
    ],
    relatedCommands: ["git stash", "git stash apply", "git stash list"]
  },
  {
    command: "git stash apply",
    description: "Apply a stash without removing it from the stash list",
    syntax: "git stash apply [stash]",
    examples: [
      "git stash apply",
      "git stash apply stash@{2}",
      "git stash apply --index"
    ],
    category: "Stashing",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Applies stashed changes but keeps the stash for potential reuse",
    tips: [
      "Useful when you want to apply the same stash to multiple branches",
      "Remember to manually delete with 'git stash drop' when done",
      "--index preserves staging area state"
    ],
    relatedCommands: ["git stash", "git stash pop", "git stash drop"]
  },
  {
    command: "git stash show",
    description: "Show the changes stored in a stash",
    syntax: "git stash show [stash]",
    examples: [
      "git stash show",
      "git stash show stash@{1}",
      "git stash show -p",
      "git stash show --stat"
    ],
    category: "Stashing",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Displays what changes are stored in a stash without applying them",
    tips: [
      "-p shows the actual diff (line changes)",
      "--stat shows file change summary",
      "Use to review stash contents before applying"
    ],
    relatedCommands: ["git stash", "git stash list", "git diff"]
  },

  // ==================== MORE CONFIGURATION ====================
  {
    command: "git config --list",
    description: "Show all Git configuration settings",
    syntax: "git config --list [options]",
    examples: [
      "git config --list",
      "git config --list --global",
      "git config --list --local"
    ],
    category: "Configuration",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Displays all configuration values and where they're set",
    tips: [
      "--global shows only global settings",
      "--local shows only repository-specific settings",
      "Settings are shown as key=value pairs"
    ],
    relatedCommands: ["git config", "git config --get"]
  },
  {
    command: "git config core.editor",
    description: "Set your preferred text editor for Git",
    syntax: "git config core.editor \"<editor-command>\"",
    examples: [
      "git config core.editor \"code --wait\"",
      "git config core.editor \"vim\"",
      "git config core.editor \"nano\""
    ],
    category: "Configuration",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Sets which program Git opens for commit messages and interactive operations",
    tips: [
      "VS Code: use 'code --wait'",
      "Vim users can use 'vim' or 'nvim'",
      "For simple editing, 'nano' is beginner-friendly"
    ],
    relatedCommands: ["git commit", "git rebase -i", "git config"]
  },
  {
    command: "git config alias.*",
    description: "Create shortcuts for frequently used Git commands",
    syntax: "git config alias.<shortcut> \"<command>\"",
    examples: [
      "git config alias.st \"status\"",
      "git config alias.co \"checkout\"",
      "git config alias.br \"branch\"",
      "git config alias.unstage \"reset HEAD --\""
    ],
    category: "Configuration",
    difficulty: "intermediate",
    commonUse: true,
    visualization: "Creates custom shortcuts that work like built-in Git commands",
    tips: [
      "Use short, memorable names for commands you use often",
      "Can create complex aliases for multi-step operations",
      "Access with 'git <alias-name>'"
    ],
    relatedCommands: ["git config", "git help"]
  },

  // ==================== MORE ADVANCED OPERATIONS ====================
  {
    command: "git rebase -i",
    description: "Interactively edit, reorder, or combine commits",
    syntax: "git rebase -i <commit>",
    examples: [
      "git rebase -i HEAD~3",
      "git rebase -i main",
      "git rebase -i --root"
    ],
    category: "Advanced Operations",
    difficulty: "advanced",
    commonUse: false,
    visualization: "Opens an editor where you can modify commit history",
    tips: [
      "pick = keep commit as is, squash = combine with previous",
      "edit = stop to modify commit, drop = delete commit",
      "--root lets you edit from the very first commit"
    ],
    relatedCommands: ["git rebase", "git commit", "git log"],
    warning: "Never rebase commits that have been shared with others"
  },
  {
    command: "git reflog",
    description: "Show a log of all reference updates (safety net for recovery)",
    syntax: "git reflog [options]",
    examples: [
      "git reflog",
      "git reflog --all",
      "git reflog show HEAD@{2.hours.ago}"
    ],
    category: "Advanced Operations",
    difficulty: "intermediate",
    commonUse: false,
    visualization: "Shows every change to branch tips, even 'deleted' commits",
    tips: [
      "Git's safety net - almost nothing is permanently lost",
      "Use to recover 'lost' commits after resets or rebases",
      "Shows timestamps of all Git operations"
    ],
    relatedCommands: ["git reset", "git checkout", "git log"]
  },

  // ==================== COLLABORATION & WORKFLOW ====================
  {
    command: "git shortlog",
    description: "Summarize commit history by author",
    syntax: "git shortlog [options]",
    examples: [
      "git shortlog",
      "git shortlog -sn",
      "git shortlog --since=\"1 month ago\""
    ],
    category: "History & Information",
    difficulty: "beginner",
    commonUse: false,
    visualization: "Groups commits by author with summary statistics",
    tips: [
      "-s shows just count of commits per author",
      "-n sorts by number of commits",
      "Great for seeing team contribution patterns"
    ],
    relatedCommands: ["git log", "git log --author"]
  },
  {
    command: "git archive",
    description: "Create archives (zip/tar) of your repository",
    syntax: "git archive [options] <tree-ish>",
    examples: [
      "git archive --format=zip HEAD > project.zip",
      "git archive --format=tar.gz v1.0 > release.tar.gz",
      "git archive main src/ > source-only.tar"
    ],
    category: "Advanced Operations",
    difficulty: "intermediate",
    commonUse: false,
    visualization: "Creates compressed archives of your project at specific commits",
    tips: [
      "Great for creating release packages",
      "Can archive specific directories or commits",
      "Doesn't include .git directory (clean distribution)"
    ],
    relatedCommands: ["git tag", "git checkout"]
  },

  // ==================== FILE TRACKING & IGNORING ====================
  {
    command: "git ls-files",
    description: "Show information about files in the index and working tree",
    syntax: "git ls-files [options]",
    examples: [
      "git ls-files",
      "git ls-files --others",
      "git ls-files --ignored --exclude-standard"
    ],
    category: "File Operations",
    difficulty: "intermediate",
    commonUse: false,
    visualization: "Lists files Git is tracking or aware of",
    tips: [
      "--others shows untracked files",
      "--ignored shows files matching .gitignore",
      "Useful for understanding what Git sees"
    ],
    relatedCommands: ["git status", "git add", "git rm"]
  },
  {
    command: "git update-index",
    description: "Manually control the staging area and file tracking",
    syntax: "git update-index [options] <file>",
    examples: [
      "git update-index --assume-unchanged config.local",
      "git update-index --no-assume-unchanged config.local",
      "git update-index --skip-worktree private.key"
    ],
    category: "File Operations",
    difficulty: "advanced",
    commonUse: false,
    visualization: "Fine-grained control over how Git tracks individual files",
    tips: [
      "--assume-unchanged ignores changes to tracked files",
      "--skip-worktree is better for files you want to keep but not track",
      "Use sparingly - can cause confusion"
    ],
    relatedCommands: ["git status", "git add", "git reset"]
  },

  // ==================== SEARCHING & FINDING ====================
  {
    command: "git log --grep",
    description: "Search commit messages for specific text",
    syntax: "git log --grep=\"<pattern>\"",
    examples: [
      "git log --grep=\"bugfix\"",
      "git log --grep=\"feature\" --oneline",
      "git log --grep=\"TODO\" --author=\"John\""
    ],
    category: "History & Information",
    difficulty: "intermediate",
    commonUse: false,
    visualization: "Filters commit history to show only commits with matching messages",
    tips: [
      "Case-sensitive by default",
      "Can combine with other log options",
      "Use regex patterns for complex searches"
    ],
    relatedCommands: ["git log", "git show", "git grep"]
  },
  {
    command: "git log --author",
    description: "Show commits by a specific author",
    syntax: "git log --author=\"<name>\"",
    examples: [
      "git log --author=\"John Doe\"",
      "git log --author=\"john@example.com\"",
      "git log --author=\"John\" --oneline"
    ],
    category: "History & Information",
    difficulty: "beginner",
    commonUse: true,
    visualization: "Filters commit history to show only commits by specified author",
    tips: [
      "Can search by name or email",
      "Partial matches work",
      "Great for reviewing someone's contributions"
    ],
    relatedCommands: ["git log", "git shortlog", "git show"]
  },

  // ==================== PERFORMANCE & MAINTENANCE ====================
  {
    command: "git count-objects",
    description: "Show statistics about repository objects",
    syntax: "git count-objects [options]",
    examples: [
      "git count-objects",
      "git count-objects -v",
      "git count-objects -H"
    ],
    category: "Maintenance",
    difficulty: "intermediate",
    commonUse: false,
    visualization: "Displays information about repository size and object count",
    tips: [
      "-v shows detailed statistics",
      "-H shows sizes in human-readable format",
      "Useful for understanding repository size"
    ],
    relatedCommands: ["git gc", "git prune"]
  },
  {
    command: "git prune",
    description: "Remove unreachable objects from the object database",
    syntax: "git prune [options]",
    examples: [
      "git prune",
      "git prune --dry-run",
      "git prune --expire=2.weeks.ago"
    ],
    category: "Maintenance",
    difficulty: "advanced",
    commonUse: false,
    visualization: "Removes objects that are no longer reachable from any reference",
    tips: [
      "Usually run automatically by git gc",
      "--dry-run shows what would be removed",
      "Can specify custom expiration times"
    ],
         relatedCommands: ["git gc", "git fsck", "git reflog"]
   },

   // ==================== MORE ESSENTIAL COMMANDS ====================
   {
     command: "git cherry-pick --no-commit",
     description: "Apply commit changes without automatically committing",
     syntax: "git cherry-pick --no-commit <commit>",
     examples: [
       "git cherry-pick --no-commit abc123f",
       "git cherry-pick --no-commit feature~2",
       "git cherry-pick -n HEAD~1"
     ],
     category: "Advanced Operations",
     difficulty: "intermediate",
     commonUse: false,
     visualization: "Applies commit changes to working directory, letting you modify before committing",
     tips: [
       "Useful when you want to modify the changes before committing",
       "-n is shorthand for --no-commit",
       "Allows you to cherry-pick and edit in one workflow"
     ],
     relatedCommands: ["git cherry-pick", "git add", "git commit"]
   },
   {
     command: "git log --since",
     description: "Show commits from a specific time period",
     syntax: "git log --since=\"<date>\" [--until=\"<date>\"]",
     examples: [
       "git log --since=\"2 weeks ago\"",
       "git log --since=\"2023-01-01\" --until=\"2023-12-31\"",
       "git log --since=\"yesterday\" --oneline"
     ],
     category: "History & Information",
     difficulty: "beginner",
     commonUse: true,
     visualization: "Filters commit history to show only commits from specified time range",
     tips: [
       "Accepts natural language dates like 'yesterday', '1 week ago'",
       "Combine with --until for specific date ranges",
       "Great for generating progress reports"
     ],
     relatedCommands: ["git log", "git log --author", "git show"]
   },
   {
     command: "git diff --cached",
     description: "Show differences between staged changes and last commit",
     syntax: "git diff --cached [file]",
     examples: [
       "git diff --cached",
       "git diff --staged",
       "git diff --cached README.md"
     ],
     category: "Basic Workflow",
     difficulty: "beginner",
     commonUse: true,
     visualization: "Shows what changes are staged and ready to be committed",
     tips: [
       "--staged is an alias for --cached",
       "Use before committing to review staged changes",
       "Helps ensure you're committing what you intended"
     ],
     relatedCommands: ["git diff", "git add", "git commit"]
   },
   {
     command: "git branch -D",
     description: "Force delete a branch even if it's not merged",
     syntax: "git branch -D <branch-name>",
     examples: [
       "git branch -D failed-experiment",
       "git branch -D feature/abandoned",
       "git branch --delete --force old-branch"
     ],
     category: "Branching",
     difficulty: "intermediate",
     commonUse: true,
     visualization: "Permanently deletes a branch regardless of merge status",
     tips: [
       "Use when you're sure you want to discard the branch",
       "Cannot be undone easily (use git reflog if needed)",
       "--delete --force is the long form"
     ],
     relatedCommands: ["git branch", "git branch -d", "git reflog"],
     warning: "This permanently deletes the branch and its unique commits"
   },
   {
     command: "git checkout -",
     description: "Switch to the previously active branch",
     syntax: "git checkout -",
     examples: [
       "git checkout -",
       "git switch -"
     ],
     category: "Branching",
     difficulty: "beginner",
     commonUse: true,
     visualization: "Quickly switches between your current and previous branch",
     tips: [
       "Like 'cd -' in the terminal",
       "Works with both checkout and switch commands",
       "Great for quickly toggling between two branches"
     ],
     relatedCommands: ["git checkout", "git switch", "git branch"]
   },
   {
     command: "git commit --fixup",
     description: "Create a fixup commit to be squashed with a previous commit",
     syntax: "git commit --fixup <commit>",
     examples: [
       "git commit --fixup HEAD~2",
       "git commit --fixup abc123f",
       "git rebase -i --autosquash HEAD~5"
     ],
     category: "Advanced Operations",
     difficulty: "advanced",
     commonUse: false,
     visualization: "Creates a special commit marked for automatic squashing during interactive rebase",
     tips: [
       "Use with 'git rebase -i --autosquash' for automatic squashing",
       "Great for fixing small issues in previous commits",
       "Keeps history clean during development"
     ],
     relatedCommands: ["git rebase", "git commit", "git log"]
   },
   {
     command: "git stash branch",
     description: "Create a new branch from a stash",
     syntax: "git stash branch <branch-name> [stash]",
     examples: [
       "git stash branch feature-from-stash",
       "git stash branch bugfix stash@{1}",
       "git stash branch experiment-branch"
     ],
     category: "Stashing",
     difficulty: "intermediate",
     commonUse: false,
     visualization: "Creates a new branch and applies the stash to it",
     tips: [
       "Useful when stashed changes conflict with current branch",
       "Automatically applies the stash after creating the branch",
       "Default uses the most recent stash"
     ],
     relatedCommands: ["git stash", "git branch", "git checkout"]
   },
   {
     command: "git remote show",
     description: "Show detailed information about a remote repository",
     syntax: "git remote show <remote-name>",
     examples: [
       "git remote show origin",
       "git remote show upstream",
       "git remote show --verbose origin"
     ],
     category: "Remote Operations",
     difficulty: "beginner",
     commonUse: true,
     visualization: "Displays URLs, branches, and tracking information for a remote",
     tips: [
       "Shows which branches are tracked and up-to-date",
       "Displays push/pull URLs",
       "Helps understand remote repository configuration"
     ],
     relatedCommands: ["git remote", "git fetch", "git push"]
   },
   {
     command: "git tag -d",
     description: "Delete a tag from your local repository",
     syntax: "git tag -d <tag-name>",
     examples: [
       "git tag -d v1.0.0",
       "git tag -d beta-release",
       "git push origin --delete v1.0.0"
     ],
     category: "Tags",
     difficulty: "beginner",
     commonUse: true,
     visualization: "Removes a tag from your local repository",
     tips: [
       "Only deletes locally - use 'git push origin --delete <tag>' for remote",
       "Use when you need to recreate a tag",
       "Cannot delete tags that don't exist"
     ],
     relatedCommands: ["git tag", "git push", "git tag -a"]
   },
   {
     command: "git describe",
     description: "Show the most recent tag reachable from a commit",
     syntax: "git describe [commit]",
     examples: [
       "git describe",
       "git describe HEAD~5",
       "git describe --tags",
       "git describe --always"
     ],
     category: "Tags",
     difficulty: "intermediate",
     commonUse: false,
     visualization: "Shows version information based on nearby tags",
     tips: [
       "Returns format like 'v1.0.0-5-g1234567' (tag-commits-hash)",
       "--tags includes lightweight tags",
       "--always shows commit hash if no tags found"
     ],
     relatedCommands: ["git tag", "git log", "git show"]
   },
   {
     command: "git notes",
     description: "Add notes to commits without changing the commit itself",
     syntax: "git notes <subcommand>",
     examples: [
       "git notes add -m \"Important fix\"",
       "git notes show HEAD",
       "git notes list",
       "git notes remove HEAD"
     ],
     category: "Advanced Operations",
     difficulty: "advanced",
     commonUse: false,
     visualization: "Attaches additional information to commits without modifying them",
     tips: [
       "Notes don't change commit hashes",
       "Useful for adding metadata or comments",
       "Not pushed by default - need 'git push origin refs/notes/*'"
     ],
     relatedCommands: ["git commit", "git log", "git show"]
   },
   {
     command: "git whatchanged",
     description: "Show what changed in each commit (legacy log format)",
     syntax: "git whatchanged [options]",
     examples: [
       "git whatchanged",
       "git whatchanged --oneline",
       "git whatchanged -p"
     ],
     category: "History & Information",
     difficulty: "beginner",
     commonUse: false,
     visualization: "Shows commit history with file change information",
     tips: [
       "Legacy command - 'git log --stat' is preferred",
       "Shows which files were modified in each commit",
       "Useful for understanding project evolution"
     ],
     relatedCommands: ["git log", "git log --stat", "git show"]
   },
   {
     command: "git bundle",
     description: "Create portable Git repository archives",
     syntax: "git bundle <subcommand> [options]",
     examples: [
       "git bundle create repo.bundle HEAD main",
       "git bundle verify repo.bundle",
       "git clone repo.bundle new-repo"
     ],
     category: "Advanced Operations",
     difficulty: "advanced",
     commonUse: false,
     visualization: "Creates a single file containing Git repository data",
     tips: [
       "Useful for transferring repositories without network access",
       "Can bundle specific branches or commit ranges",
       "Verify bundles before using them"
     ],
     relatedCommands: ["git clone", "git fetch", "git archive"]
   },
   {
     command: "git for-each-ref",
     description: "Iterate over all refs and output information about them",
     syntax: "git for-each-ref [options] [pattern]",
     examples: [
       "git for-each-ref",
       "git for-each-ref refs/heads/",
       "git for-each-ref --format='%(refname:short)' refs/heads/"
     ],
     category: "Advanced Operations",
     difficulty: "advanced",
     commonUse: false,
     visualization: "Lists all references (branches, tags) with detailed information",
     tips: [
       "Useful for scripting and automation",
       "Can filter by reference type or pattern",
       "Supports custom output formats"
     ],
     relatedCommands: ["git branch", "git tag", "git show-ref"]
   },
   {
     command: "git rerere",
     description: "Reuse recorded resolution of conflicted merges",
     syntax: "git rerere [subcommand]",
     examples: [
       "git rerere",
       "git rerere diff",
       "git rerere status",
       "git config rerere.enabled true"
     ],
     category: "Advanced Operations",
     difficulty: "advanced",
     commonUse: false,
     visualization: "Automatically resolves merge conflicts based on previous resolutions",
     tips: [
       "Must be enabled with 'git config rerere.enabled true'",
       "Remembers how you resolved conflicts before",
       "Saves time when rebasing or merging similar conflicts"
     ],
     relatedCommands: ["git merge", "git rebase", "git config"]
   },
   {
     command: "git worktree add",
     description: "Create a new working tree linked to the repository",
     syntax: "git worktree add <path> [branch]",
     examples: [
       "git worktree add ../feature-branch feature",
       "git worktree add ../hotfix -b hotfix/urgent",
       "git worktree add --detach ../temp HEAD~1"
     ],
     category: "Worktrees",
     difficulty: "advanced",
     commonUse: false,
     visualization: "Creates additional working directories for the same repository",
     tips: [
       "Each worktree can have a different branch checked out",
       "Shares the same .git directory",
       "Useful for working on multiple features simultaneously"
     ],
     relatedCommands: ["git worktree", "git branch", "git checkout"]
   },
   {
     command: "git rev-parse",
     description: "Parse and validate Git object names and references",
     syntax: "git rev-parse <object>",
     examples: [
       "git rev-parse HEAD",
       "git rev-parse main~3",
       "git rev-parse --short HEAD",
       "git rev-parse --is-inside-work-tree"
     ],
     category: "Advanced Operations",
     difficulty: "advanced",
     commonUse: false,
     visualization: "Converts Git references to commit hashes and provides repository info",
     tips: [
       "Essential for Git scripting",
       "--short gives abbreviated commit hashes",
       "Can check if you're inside a Git repository"
     ],
     relatedCommands: ["git show", "git log", "git symbolic-ref"]
   },
   {
     command: "git symbolic-ref",
     description: "Manage symbolic references like HEAD",
     syntax: "git symbolic-ref <name> [ref]",
     examples: [
       "git symbolic-ref HEAD",
       "git symbolic-ref HEAD refs/heads/main",
       "git symbolic-ref --short HEAD"
     ],
     category: "Advanced Operations",
     difficulty: "advanced",
     commonUse: false,
     visualization: "Shows or sets what HEAD and other symbolic refs point to",
     tips: [
       "Shows the full reference name HEAD points to",
       "--short gives just the branch name",
       "Used internally by Git and in advanced scripting"
     ],
     relatedCommands: ["git branch", "git checkout", "git rev-parse"]
   },
   {
     command: "git show-branch",
     description: "Show branches and their commits in a visual format",
     syntax: "git show-branch [options] [branches]",
     examples: [
       "git show-branch",
       "git show-branch main feature",
       "git show-branch --all",
       "git show-branch --current"
     ],
     category: "History & Information",
     difficulty: "intermediate",
     commonUse: false,
     visualization: "Displays branch relationships and commit ancestry",
     tips: [
       "Alternative to 'git log --graph' for branch visualization",
       "Shows which commits are unique to each branch",
       "--all includes remote branches"
     ],
     relatedCommands: ["git log --graph", "git branch", "git merge-base"]
   },
   {
     command: "git merge-base",
     description: "Find the common ancestor of two commits",
     syntax: "git merge-base <commit1> <commit2>",
     examples: [
       "git merge-base main feature",
       "git merge-base HEAD HEAD~5",
       "git merge-base --is-ancestor main feature"
     ],
     category: "Advanced Operations",
     difficulty: "intermediate",
     commonUse: false,
     visualization: "Finds the commit where two branches diverged",
     tips: [
       "Useful for understanding branch relationships",
       "--is-ancestor checks if one commit is ancestor of another",
       "Essential for advanced Git scripting"
     ],
     relatedCommands: ["git log", "git show-branch", "git rebase"]
   },
   {
     command: "git ls-tree",
     description: "List the contents of a tree object (directory)",
     syntax: "git ls-tree [options] <tree-ish> [path]",
     examples: [
       "git ls-tree HEAD",
       "git ls-tree -r HEAD",
       "git ls-tree HEAD src/",
       "git ls-tree --name-only HEAD"
     ],
     category: "File Operations",
     difficulty: "intermediate",
     commonUse: false,
     visualization: "Shows files and directories in a commit as Git sees them",
     tips: [
       "-r recursively lists all files",
       "--name-only shows just filenames",
       "Useful for understanding Git's internal object structure"
     ],
     relatedCommands: ["git show", "git cat-file", "git ls-files"]
   },
   {
     command: "git cat-file",
     description: "Display Git object information and contents",
     syntax: "git cat-file <type> <object>",
     examples: [
       "git cat-file -t HEAD",
       "git cat-file -p HEAD",
       "git cat-file -s HEAD:README.md",
       "git cat-file commit HEAD"
     ],
     category: "Advanced Operations",
     difficulty: "advanced",
     commonUse: false,
     visualization: "Shows raw Git object data (commits, trees, blobs)",
     tips: [
       "-t shows object type, -p shows pretty-printed content",
       "-s shows object size",
       "Essential for understanding Git internals"
     ],
     relatedCommands: ["git show", "git ls-tree", "git rev-parse"]
   },
   {
     command: "git filter-branch",
     description: "Rewrite Git repository history (use git filter-repo instead)",
     syntax: "git filter-branch [options] [rev-list-options]",
     examples: [
       "git filter-branch --env-filter 'export GIT_AUTHOR_EMAIL=\"new@email.com\"'",
       "git filter-branch --tree-filter 'rm -f passwords.txt'",
       "git filter-branch --subdirectory-filter mysubdir"
     ],
     category: "Advanced Operations",
     difficulty: "advanced",
     commonUse: false,
     visualization: "Rewrites repository history by applying filters to all commits",
     tips: [
       "Deprecated - use 'git filter-repo' instead",
       "Can remove sensitive data from history",
       "Changes all commit hashes"
     ],
     relatedCommands: ["git rebase", "git reset", "git clean"],
     warning: "This rewrites history and changes all commit hashes - coordinate with team"
   },
   {
     command: "git replace",
     description: "Create, list, or delete object replacement refs",
     syntax: "git replace [options] <object> <replacement>",
     examples: [
       "git replace abc123 def456",
       "git replace --list",
       "git replace --delete abc123"
     ],
     category: "Advanced Operations",
     difficulty: "advanced",
     commonUse: false,
     visualization: "Temporarily replaces one Git object with another",
     tips: [
       "Useful for testing history modifications",
       "Does not actually change repository history",
       "Replacement is local to your repository"
     ],
     relatedCommands: ["git show", "git log", "git cat-file"]
   },
   {
     command: "git check-ignore",
     description: "Debug .gitignore files and check if files are ignored",
     syntax: "git check-ignore [options] <file>",
     examples: [
       "git check-ignore secret.txt",
       "git check-ignore -v build/",
       "git check-ignore --no-index temp.log"
     ],
     category: "File Operations",
     difficulty: "beginner",
     commonUse: true,
     visualization: "Shows whether files match .gitignore patterns and which rule",
     tips: [
       "-v shows which .gitignore rule matches",
       "Helps debug why files aren't being tracked",
       "Exit code 0 means file is ignored"
     ],
     relatedCommands: ["git add", "git status", "git ls-files"]
   },
   {
     command: "git credential",
     description: "Manage stored authentication credentials",
     syntax: "git credential <subcommand>",
     examples: [
       "git credential fill",
       "git credential approve",
       "git credential reject",
       "git config credential.helper store"
     ],
     category: "Configuration",
     difficulty: "intermediate",
     commonUse: false,
     visualization: "Manages how Git stores and retrieves authentication information",
     tips: [
       "Usually managed automatically by Git",
       "Can configure different credential helpers",
       "Useful for troubleshooting authentication issues"
     ],
     relatedCommands: ["git config", "git push", "git pull"]
   },
   {
     command: "git maintenance",
     description: "Run maintenance tasks on the repository",
     syntax: "git maintenance <subcommand>",
     examples: [
       "git maintenance run",
       "git maintenance start",
       "git maintenance stop",
       "git maintenance register"
     ],
     category: "Maintenance",
     difficulty: "intermediate",
     commonUse: false,
     visualization: "Performs repository optimization and cleanup tasks",
     tips: [
       "Includes tasks like gc, repack, and commit-graph updates",
       "Can be scheduled to run automatically",
       "Improves repository performance over time"
     ],
     relatedCommands: ["git gc", "git repack", "git commit-graph"]
   },
   {
     command: "git sparse-checkout",
     description: "Work with only a subset of repository files",
     syntax: "git sparse-checkout <subcommand>",
     examples: [
       "git sparse-checkout init --cone",
       "git sparse-checkout set src/",
       "git sparse-checkout add docs/",
       "git sparse-checkout disable"
     ],
     category: "Advanced Operations",
     difficulty: "advanced",
     commonUse: false,
     visualization: "Configures Git to only checkout specified directories or files",
     tips: [
       "Useful for very large repositories",
       "--cone mode is more efficient",
       "Reduces working directory size"
     ],
     relatedCommands: ["git checkout", "git clone", "git config"]
   },
   {
     command: "git switch --orphan",
     description: "Create a new branch with no commit history",
     syntax: "git switch --orphan <new-branch>",
     examples: [
       "git switch --orphan gh-pages",
       "git switch --orphan docs",
       "git switch --orphan clean-start"
     ],
     category: "Branching",
     difficulty: "intermediate",
     commonUse: false,
     visualization: "Creates a branch that starts with no parent commits",
     tips: [
       "Useful for GitHub Pages or documentation branches",
       "Working directory keeps current files but they're unstaged",
       "First commit on orphan branch has no parents"
     ],
     relatedCommands: ["git switch", "git branch", "git commit"]
   },
   {
     command: "git interpret-trailers",
     description: "Add or parse structured information in commit messages",
     syntax: "git interpret-trailers [options]",
     examples: [
       "git interpret-trailers --trailer 'Signed-off-by: John <john@example.com>'",
       "git interpret-trailers --parse",
       "git log --format='%(trailers)'"
     ],
     category: "Advanced Operations",
     difficulty: "advanced",
     commonUse: false,
     visualization: "Manages structured metadata in commit messages",
     tips: [
       "Useful for adding sign-offs, reviewers, or issue references",
       "Can be automated with commit templates",
       "Supports parsing existing trailers"
     ],
     relatedCommands: ["git commit", "git log", "git format-patch"]
   }
 ];

// Categories for filtering with icons
const categories = [
  { name: "All Commands", icon: Terminal, count: gitCommands.length },
  { name: "Repository Setup", icon: GitBranch, count: gitCommands.filter(cmd => cmd.category === "Repository Setup").length },
  { name: "Basic Workflow", icon: GitCommit, count: gitCommands.filter(cmd => cmd.category === "Basic Workflow").length },
  { name: "Branching", icon: GitBranch, count: gitCommands.filter(cmd => cmd.category === "Branching").length },
  { name: "Remote Operations", icon: GitPullRequest, count: gitCommands.filter(cmd => cmd.category === "Remote Operations").length },
  { name: "History & Information", icon: Eye, count: gitCommands.filter(cmd => cmd.category === "History & Information").length },
  { name: "Undoing Changes", icon: RotateCcw, count: gitCommands.filter(cmd => cmd.category === "Undoing Changes").length },
  { name: "Stashing", icon: FileText, count: gitCommands.filter(cmd => cmd.category === "Stashing").length },
  { name: "Advanced Operations", icon: Zap, count: gitCommands.filter(cmd => cmd.category === "Advanced Operations").length },
  { name: "Configuration", icon: Settings, count: gitCommands.filter(cmd => cmd.category === "Configuration").length },
  { name: "Tags", icon: GitCommit, count: gitCommands.filter(cmd => cmd.category === "Tags").length },
  { name: "File Operations", icon: FileText, count: gitCommands.filter(cmd => cmd.category === "File Operations").length },
  { name: "Submodules", icon: GitBranch, count: gitCommands.filter(cmd => cmd.category === "Submodules").length },
  { name: "Debugging", icon: Eye, count: gitCommands.filter(cmd => cmd.category === "Debugging").length },
  { name: "Hooks", icon: Zap, count: gitCommands.filter(cmd => cmd.category === "Hooks").length },
  { name: "Maintenance", icon: Settings, count: gitCommands.filter(cmd => cmd.category === "Maintenance").length },
  { name: "Worktrees", icon: GitBranch, count: gitCommands.filter(cmd => cmd.category === "Worktrees").length },
  { name: "Patches", icon: FileText, count: gitCommands.filter(cmd => cmd.category === "Patches").length }
];

export default function GitCheatSheet() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Commands");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [expandedCommands, setExpandedCommands] = useState<Set<string>>(new Set());
  const [copiedCommand, setCopiedCommand] = useState<string>("");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const { toast } = useToast();

  const filteredCommands = useMemo(() => {
    return gitCommands.filter(cmd => {
      const matchesSearch = cmd.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cmd.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All Commands" || cmd.category === selectedCategory;
      const matchesDifficulty = difficultyFilter === "all" || cmd.difficulty === difficultyFilter;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchTerm, selectedCategory, difficultyFilter]);

  const toggleCommandExpansion = (command: string) => {
    const newExpanded = new Set(expandedCommands);
    if (newExpanded.has(command)) {
      newExpanded.delete(command);
    } else {
      newExpanded.add(command);
    }
    setExpandedCommands(newExpanded);
  };

  const copyCommand = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommand(command);
      toast({
        title: "Command copied!",
        description: `"${command}" has been copied to clipboard`,
      });
      setTimeout(() => setCopiedCommand(""), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy command to clipboard",
        variant: "destructive",
      });
    }
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AppHeader 
        onToggleMobileSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
        onStartWalkthrough={() => {}}
      />

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileSidebar(false)}>
          <div className="absolute left-0 top-16 bottom-0 w-4/5 max-w-sm bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Git Cheat Sheet</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Comprehensive Git command reference with examples and explanations.
              </p>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Quick Navigation</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Use the search and filters above to find specific commands.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-16 min-h-full overflow-auto">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-github-blue via-blue-600 to-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 sm:p-4 bg-white/20 rounded-full backdrop-blur-sm">
                  <Terminal className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white">
                Interactive Git Cheat Sheet
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed px-4">
                Master Git with our comprehensive, searchable command reference featuring interactive examples, 
                beautiful visualizations, and expert tips.
              </p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 pt-4">
                <Badge className="bg-white/20 text-white border-white/30 text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2">
                  101+ Commands
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2">
                  Interactive Examples
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2">
                  Visual Learning
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative w-full max-w-md mx-auto lg:mx-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  placeholder="Search Git commands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 h-10 sm:h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-github-blue dark:focus:border-github-blue text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.slice(0, 6).map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.name}
                      variant={selectedCategory === category.name ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category.name)}
                      size="sm"
                      className={`whitespace-nowrap gap-1 sm:gap-2 text-xs sm:text-sm font-medium ${
                        selectedCategory === category.name 
                          ? "bg-github-blue hover:bg-github-blue/90 text-white border-github-blue" 
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{category.name}</span>
                      <span className="sm:hidden">{category.name.split(' ')[0]}</span>
                      <Badge variant="secondary" className="ml-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-none">
                        {category.count}
                      </Badge>
                    </Button>
                  );
                })}
              </div>

              {/* Difficulty Filter */}
              <div className="flex gap-2 justify-center lg:justify-start">
                {["all", "beginner", "intermediate", "advanced"].map((difficulty) => (
                  <Button
                    key={difficulty}
                    variant={difficultyFilter === difficulty ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDifficultyFilter(difficulty)}
                    className={`capitalize text-xs sm:text-sm font-medium ${
                      difficultyFilter === difficulty 
                        ? "bg-github-blue hover:bg-github-blue/90 text-white border-github-blue" 
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {difficulty === "all" ? "All Levels" : difficulty}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

      {/* Commands Grid - Full Scrollable Area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="space-y-4 sm:space-y-6">
            {filteredCommands.length === 0 ? (
              <Card className="p-8 sm:p-12 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="space-y-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                    <Search className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500 dark:text-gray-400" />
                  </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">No commands found</h3>
                <p className="text-gray-700 dark:text-gray-400 max-w-md mx-auto font-medium">
                  Try adjusting your search terms or filters to find the Git commands you're looking for.
                </p>
              </div>
            </Card>
          ) : (
            filteredCommands.map((cmd) => {
              const isExpanded = expandedCommands.has(cmd.command);
              const isCopied = copiedCommand === cmd.command;
              
              return (
                <Card 
                  key={cmd.command} 
                  className="bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-github-blue/50 dark:hover:border-github-blue/50"
                >
                  <Collapsible open={isExpanded} onOpenChange={() => toggleCommandExpansion(cmd.command)}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-gradient-to-br from-github-blue to-indigo-600 rounded-lg">
                              <Terminal className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <CardTitle className="text-xl font-mono text-github-blue dark:text-blue-400">
                                  {cmd.command}
                                </CardTitle>
                                <Badge className={getDifficultyColor(cmd.difficulty)}>
                                  {cmd.difficulty}
                                </Badge>
                                {cmd.commonUse && (
                                  <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-400">
                                    Popular
                                  </Badge>
                                )}
                              </div>
                              <CardDescription className="text-base text-gray-800 dark:text-gray-300 font-medium">
                                {cmd.description}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyCommand(cmd.command);
                              }}
                              className="gap-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                            >
                              {isCopied ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                              {isCopied ? "Copied!" : "Copy"}
                            </Button>
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-6 max-h-96 overflow-y-auto">
                        {/* Syntax */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-lg flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            <FileText className="h-4 w-4" />
                            Syntax
                          </h4>
                          <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 text-green-400 font-mono text-sm">
                            {cmd.syntax}
                          </div>
                        </div>

                        {/* Examples */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-lg flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            <Terminal className="h-4 w-4" />
                            Examples
                          </h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {cmd.examples.map((example, index) => (
                              <div key={index} className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 flex items-center justify-between">
                                <code className="text-green-400 font-mono text-sm">{example}</code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyCommand(example)}
                                  className="text-gray-400 hover:text-white"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Visualization */}
                        {cmd.visualization && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-lg flex items-center gap-2 text-gray-900 dark:text-gray-100">
                              <Eye className="h-4 w-4" />
                              What it does
                            </h4>
                            <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                              <p className="text-blue-900 dark:text-blue-200 font-medium">{cmd.visualization}</p>
                            </div>
                          </div>
                        )}

                        {/* Tips */}
                        {cmd.tips && cmd.tips.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-lg flex items-center gap-2 text-gray-900 dark:text-gray-100">
                              <Zap className="h-4 w-4" />
                              Pro Tips
                            </h4>
                            <ul className="space-y-2 max-h-32 overflow-y-auto">
                              {cmd.tips.map((tip, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                                  <span className="text-sm text-gray-800 dark:text-gray-300 font-medium">{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Warning */}
                        {cmd.warning && (
                          <div className="space-y-2">
                            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
                              <div className="flex items-start gap-2">
                                <RotateCcw className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <h5 className="font-medium text-red-800 dark:text-red-200 mb-1">Caution</h5>
                                  <p className="text-sm text-red-800 dark:text-red-300 font-medium">{cmd.warning}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Related Commands */}
                        {cmd.relatedCommands && cmd.relatedCommands.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-lg flex items-center gap-2 text-gray-900 dark:text-gray-100">
                              <GitBranch className="h-4 w-4" />
                              Related Commands
                            </h4>
                            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                              {cmd.relatedCommands.map((relatedCmd, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className="font-mono cursor-pointer hover:bg-github-blue hover:text-white transition-colors border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-300 font-medium"
                                  onClick={() => setSearchTerm(relatedCmd)}
                                >
                                  {relatedCmd}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
          <h3 className="text-2xl font-bold">Master Git with GitSarva</h3>
          <p className="text-gray-300 max-w-2xl mx-auto">
            This interactive cheat sheet is part of GitSarva's comprehensive Git learning platform. 
            Practice these commands in our safe sandbox environment and master Git through hands-on experience.
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Start Learning
            </Button>
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Practice Sandbox
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 