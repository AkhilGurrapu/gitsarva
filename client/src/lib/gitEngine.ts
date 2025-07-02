import { useState, useCallback, useEffect } from "react";
import { GitCommit, RepositoryState, GitFile, CommandResult } from "./gitTypes";

// Mock Git engine for learning purposes
class GitEngine {
  private state: RepositoryState = {
    initialized: false,
    currentBranch: null,
    branches: {},
    commits: [],
    stagedFiles: [],
    workingDirectory: 'clean',
    files: [],
  };

  constructor() {
    // Initialize with some sample files for demo
    this.state.files = [
      { name: 'README.md', content: '# My Project\n\nThis is a sample project.', status: 'untracked' },
      { name: 'index.js', content: 'console.log("Hello, World!");', status: 'untracked' },
      { name: 'style.css', content: 'body { margin: 0; padding: 20px; }', status: 'untracked' }
    ];
  }

  private generateHash(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  private updateWorkingDirectoryStatus() {
    const hasUnstagedChanges = this.state.files.some(f => f.status === 'modified' || f.status === 'untracked');
    this.state.workingDirectory = hasUnstagedChanges ? 'modified' : 'clean';
    
    // Update staged files array - create new array reference
    this.state.stagedFiles = [...this.state.files
      .filter(f => f.status === 'staged')
      .map(f => f.name)];
  }

  async executeCommand(command: string): Promise<CommandResult> {
    const parts = command.trim().split(/\s+/);
    const [git, subcommand, ...args] = parts;

    if (git !== 'git') {
      return { 
        output: '', 
        error: `Command not found: ${git}. This is a Git playground - only Git commands are supported.` 
      };
    }

    try {
      let result: CommandResult;
      switch (subcommand) {
        case 'init':
          result = this.init();
          break;
        case 'status':
          result = this.status();
          break;
        case 'add':
          result = this.add(args);
          break;
        case 'commit':
          result = this.commit(args);
          break;
        case 'branch':
          result = this.branch(args);
          break;
        case 'checkout':
          result = this.checkout(args);
          break;
        case 'log':
          result = this.log(args);
          break;
        case 'diff':
          result = this.diff(args);
          break;
        case 'show':
          result = this.show(args);
          break;
        case 'reset':
          result = this.reset(args);
          break;
        case 'merge':
          result = this.merge(args);
          break;
        default:
          result = { 
            output: '', 
            error: `Unknown git command: ${subcommand}. Try 'git status' or 'git help'.` 
          };
      }
      
      // Notify all components about state changes
      notifyStateUpdate();
      return result;
      
    } catch (error) {
      return { 
        output: '', 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  private init(): CommandResult {
    if (this.state.initialized) {
      return { 
        output: '', 
        error: 'Repository already initialized.' 
      };
    }

    this.state.initialized = true;
    this.state.currentBranch = 'main';
    this.state.branches = { main: [] };
    
    return { 
      output: 'Initialized empty Git repository in /playground/.git/', 
      error: '' 
    };
  }

  private status(): CommandResult {
    if (!this.state.initialized) {
      return { 
        output: '', 
        error: 'Not a git repository. Run \'git init\' first.' 
      };
    }

    let output = `On branch ${this.state.currentBranch}\n`;
    
    const untrackedFiles = this.state.files.filter(f => f.status === 'untracked');
    const modifiedFiles = this.state.files.filter(f => f.status === 'modified');
    const stagedFiles = this.state.files.filter(f => f.status === 'staged');

    if (this.state.commits.length === 0) {
      output += '\nNo commits yet\n';
    }

    if (stagedFiles.length > 0) {
      output += '\nChanges to be committed:\n';
      stagedFiles.forEach(f => {
        output += `  new file:   ${f.name}\n`;
      });
    }

    if (modifiedFiles.length > 0) {
      output += '\nChanges not staged for commit:\n';
      modifiedFiles.forEach(f => {
        output += `  modified:   ${f.name}\n`;
      });
    }

    if (untrackedFiles.length > 0) {
      output += '\nUntracked files:\n';
      untrackedFiles.forEach(f => {
        output += `  ${f.name}\n`;
      });
      output += '\nnothing added to commit but untracked files present (use "git add" to track)\n';
    }

    if (stagedFiles.length === 0 && modifiedFiles.length === 0 && untrackedFiles.length === 0) {
      output += '\nnothing to commit, working tree clean\n';
    }

    return { output, error: '' };
  }

  private add(args: string[]): CommandResult {
    if (!this.state.initialized) {
      return { 
        output: '', 
        error: 'Not a git repository. Run \'git init\' first.' 
      };
    }

    if (args.length === 0) {
      return { 
        output: '', 
        error: 'Nothing specified, nothing added. Maybe you wanted to say \'git add .\'?' 
      };
    }

    const target = args[0];
    
    if (target === '.') {
      // Add all files - create new array with updated file objects
      const unstagedNames = this.state.files
        .filter(f => f.status === 'untracked' || f.status === 'modified')
        .map(f => f.name);
      
      this.state.files = this.state.files.map(f => 
        unstagedNames.includes(f.name) 
          ? { ...f, status: 'staged' as const }
          : f
      );
      
      this.updateWorkingDirectoryStatus();
      return { 
        output: unstagedNames.length > 0 ? `Added ${unstagedNames.length} file(s) to staging area.` : 'No files to add.', 
        error: '' 
      };
    } else {
      // Add specific file
      const fileIndex = this.state.files.findIndex(f => f.name === target);
      if (fileIndex === -1) {
        return { 
          output: '', 
          error: `pathspec '${target}' did not match any files` 
        };
      }
      
      const file = this.state.files[fileIndex];
      if (file.status === 'staged' || file.status === 'committed') {
        return { 
          output: `File '${target}' is already staged or committed.`, 
          error: '' 
        };
      }
      
      // Create new array with updated file
      this.state.files = this.state.files.map((f, index) => 
        index === fileIndex ? { ...f, status: 'staged' as const } : f
      );
      
      this.updateWorkingDirectoryStatus();
      return { 
        output: `Added '${target}' to staging area.`, 
        error: '' 
      };
    }
  }

  private commit(args: string[]): CommandResult {
    if (!this.state.initialized) {
      return { 
        output: '', 
        error: 'Not a git repository. Run \'git init\' first.' 
      };
    }

    const stagedFiles = this.state.files.filter(f => f.status === 'staged');
    
    if (stagedFiles.length === 0) {
      return { 
        output: '', 
        error: 'No changes added to the commit. Use \'git add\' to stage files.' 
      };
    }

    // Parse commit message
    let message = 'Commit message';
    const messageIndex = args.indexOf('-m');
    if (messageIndex >= 0 && messageIndex + 1 < args.length) {
      message = args.slice(messageIndex + 1).join(' ').replace(/['"]/g, '');
    }

    // Create commit
    const commit: GitCommit = {
      hash: this.generateHash(),
      message,
      date: new Date().toISOString(),
      author: 'Git User',
      files: stagedFiles.map(f => f.name),
    };

    // Create new commits array
    this.state.commits = [...this.state.commits, commit];
    if (this.state.currentBranch) {
      this.state.branches[this.state.currentBranch] = [...this.state.commits];
    }

    // Update file statuses - create new array with updated file objects
    const stagedFileNames = stagedFiles.map(f => f.name);
    this.state.files = this.state.files.map(f => 
      stagedFileNames.includes(f.name) 
        ? { ...f, status: 'committed' as const }
        : f
    );

    this.updateWorkingDirectoryStatus();

    return { 
      output: `[${this.state.currentBranch} ${commit.hash}] ${message}\n ${stagedFiles.length} file${stagedFiles.length !== 1 ? 's' : ''} changed`, 
      error: '' 
    };
  }

  private branch(args: string[]): CommandResult {
    if (!this.state.initialized) {
      return { 
        output: '', 
        error: 'Not a git repository. Run \'git init\' first.' 
      };
    }

    if (args.length === 0) {
      // List branches
      let output = '';
      Object.keys(this.state.branches).forEach(branch => {
        if (branch === this.state.currentBranch) {
          output += `* ${branch}\n`;
        } else {
          output += `  ${branch}\n`;
        }
      });
      return { output, error: '' };
    }

    const newBranch = args[0];
    if (this.state.branches[newBranch]) {
      return { 
        output: '', 
        error: `A branch named '${newBranch}' already exists.` 
      };
    }

    // Create new branch from current state
    this.state.branches[newBranch] = [...this.state.commits];
    
    return { 
      output: `Created branch '${newBranch}'.`, 
      error: '' 
    };
  }

  private checkout(args: string[]): CommandResult {
    if (!this.state.initialized) {
      return { 
        output: '', 
        error: 'Not a git repository. Run \'git init\' first.' 
      };
    }

    if (args.length === 0) {
      return { 
        output: '', 
        error: 'You must specify a branch name.' 
      };
    }

    const targetBranch = args[0];
    if (!this.state.branches[targetBranch]) {
      return { 
        output: '', 
        error: `Branch '${targetBranch}' does not exist.` 
      };
    }

    this.state.currentBranch = targetBranch;
    this.state.commits = [...this.state.branches[targetBranch]];
    
    return { 
      output: `Switched to branch '${targetBranch}'`, 
      error: '' 
    };
  }

  private log(args: string[]): CommandResult {
    if (!this.state.initialized) {
      return { 
        output: '', 
        error: 'Not a git repository. Run \'git init\' first.' 
      };
    }

    if (this.state.commits.length === 0) {
      return { 
        output: '', 
        error: 'No commits found.' 
      };
    }

    const oneline = args.includes('--oneline');
    let output = '';
    
    if (oneline) {
      this.state.commits.slice().reverse().forEach(commit => {
        output += `${commit.hash.substring(0, 7)} ${commit.message}\n`;
      });
    } else {
      this.state.commits.slice().reverse().forEach(commit => {
        output += `commit ${commit.hash}\n`;
        output += `Author: ${commit.author}\n`;
        output += `Date: ${new Date(commit.date).toLocaleString()}\n\n`;
        output += `    ${commit.message}\n\n`;
      });
    }

    return { output, error: '' };
  }

  private show(args: string[]): CommandResult {
    if (!this.state.initialized) {
      return { 
        output: '', 
        error: 'Not a git repository. Run \'git init\' first.' 
      };
    }

    if (this.state.commits.length === 0) {
      return { 
        output: '', 
        error: 'No commits found.' 
      };
    }

    let targetCommit: GitCommit | undefined;
    
    if (args.length === 0) {
      // Show HEAD commit
      targetCommit = this.state.commits[this.state.commits.length - 1];
    } else {
      // Find commit by hash prefix
      const hashPrefix = args[0];
      targetCommit = this.state.commits.find(c => c.hash.startsWith(hashPrefix));
      
      if (!targetCommit) {
        return { 
          output: '', 
          error: `Commit '${hashPrefix}' not found.` 
        };
      }
    }

    let output = `commit ${targetCommit.hash}\n`;
    output += `Author: ${targetCommit.author}\n`;
    output += `Date: ${new Date(targetCommit.date).toLocaleString()}\n\n`;
    output += `    ${targetCommit.message}\n\n`;
    
    if (targetCommit.files.length > 0) {
      output += `Files changed in this commit:\n`;
      targetCommit.files.forEach(fileName => {
        const file = this.state.files.find(f => f.name === fileName);
        if (file) {
          output += `+++ ${fileName}\n`;
          output += `    Content: ${file.content.substring(0, 100)}${file.content.length > 100 ? '...' : ''}\n`;
        }
      });
    }

    return { output, error: '' };
  }

  private reset(args: string[]): CommandResult {
    if (!this.state.initialized) {
      return { 
        output: '', 
        error: 'Not a git repository. Run \'git init\' first.' 
      };
    }

    if (args.length === 0) {
      return { 
        output: '', 
        error: 'Please specify what to reset. Try \'git reset HEAD\' or \'git reset --hard\'.' 
      };
    }

    const target = args[0];
    
    if (target === 'HEAD' || target === '--soft') {
      // Reset staged files back to working directory
      this.state.files = this.state.files.map(f => 
        f.status === 'staged' ? { ...f, status: 'modified' as const } : f
      );
      this.updateWorkingDirectoryStatus();
      return { 
        output: 'Unstaged all changes. Files moved back to working directory.', 
        error: '' 
      };
    } else if (target === '--hard') {
      // Reset everything to last commit state
      this.state.files = this.state.files.map(f => 
        f.status === 'staged' || f.status === 'modified' 
          ? { ...f, status: 'committed' as const }
          : f
      );
      this.updateWorkingDirectoryStatus();
      return { 
        output: 'Hard reset complete. All changes discarded.', 
        error: '' 
      };
    }

    return { 
      output: '', 
      error: `Unknown reset option: ${target}. Try 'git reset HEAD' or 'git reset --hard'.` 
    };
  }

  private merge(args: string[]): CommandResult {
    if (!this.state.initialized) {
      return { 
        output: '', 
        error: 'Not a git repository. Run \'git init\' first.' 
      };
    }

    if (args.length === 0) {
      return { 
        output: '', 
        error: 'Please specify a branch to merge.' 
      };
    }

    const targetBranch = args[0];
    
    if (!this.state.branches[targetBranch]) {
      return { 
        output: '', 
        error: `Branch '${targetBranch}' does not exist.` 
      };
    }

    if (targetBranch === this.state.currentBranch) {
      return { 
        output: '', 
        error: 'Cannot merge a branch into itself.' 
      };
    }

    // Simple merge simulation - just create a merge commit
    const mergeCommit: GitCommit = {
      hash: this.generateHash(),
      message: `Merge branch '${targetBranch}' into ${this.state.currentBranch}`,
      date: new Date().toISOString(),
      author: 'Git User',
      files: [],
    };

    this.state.commits = [...this.state.commits, mergeCommit];
    if (this.state.currentBranch) {
      this.state.branches[this.state.currentBranch] = [...this.state.commits];
    }

    return { 
      output: `Merge completed. Created merge commit ${mergeCommit.hash.substring(0, 7)}.`, 
      error: '' 
    };
  }

  private diff(args: string[]): CommandResult {
    if (!this.state.initialized) {
      return { 
        output: '', 
        error: 'Not a git repository. Run \'git init\' first.' 
      };
    }

    const modifiedFiles = this.state.files.filter(f => f.status === 'modified');
    
    if (modifiedFiles.length === 0) {
      return { 
        output: 'No changes detected.', 
        error: '' 
      };
    }

    let output = '';
    modifiedFiles.forEach(file => {
      output += `diff --git a/${file.name} b/${file.name}\n`;
      output += `--- a/${file.name}\n`;
      output += `+++ b/${file.name}\n`;
      output += `@@ -1,1 +1,1 @@\n`;
      output += `-${file.content}\n`;
      output += `+${file.content} (modified)\n`;
    });

    return { output, error: '' };
  }

  getState(): RepositoryState {
    return { 
      ...this.state,
      files: [...this.state.files], // Create new array reference
      commits: [...this.state.commits], // Create new array reference
      stagedFiles: [...this.state.stagedFiles], // Create new array reference
      branches: { ...this.state.branches } // Create new object reference
    };
  }

  getCurrentBranch(): string | null {
    return this.state.currentBranch;
  }

  getRepositoryState(): RepositoryState {
    return this.getState();
  }

  getFiles(): GitFile[] {
    return [...this.state.files];
  }
}

// React hook for using the Git engine
// Global git engine instance to maintain state across components
let globalGitEngine: GitEngine | null = null;
let stateUpdateListeners: Array<() => void> = [];

function getGlobalGitEngine(): GitEngine {
  if (!globalGitEngine) {
    globalGitEngine = new GitEngine();
  }
  return globalGitEngine;
}

function notifyStateUpdate() {
  stateUpdateListeners.forEach(listener => listener());
}

export function useGitEngine() {
  const [, forceUpdate] = useState({});
  const engine = getGlobalGitEngine();

  // Force re-render when state updates
  const triggerUpdate = useCallback(() => {
    forceUpdate({});
  }, []);

  // Subscribe to state updates
  useEffect(() => {
    stateUpdateListeners.push(triggerUpdate);
    return () => {
      stateUpdateListeners = stateUpdateListeners.filter(listener => listener !== triggerUpdate);
    };
  }, [triggerUpdate]);

  const executeCommand = useCallback(async (command: string): Promise<CommandResult> => {
    console.log('🚀 Executing command:', command);
    const result = await engine.executeCommand(command);
    const newState = engine.getRepositoryState();
    console.log('📊 New state after command:', {
      initialized: newState.initialized,
      filesCount: newState.files.length,
      files: newState.files.map(f => ({ name: f.name, status: f.status })),
      commits: newState.commits.length,
      stagedFiles: newState.stagedFiles
    });
    notifyStateUpdate(); // Notify all components of state change
    return result;
  }, [engine]);

  const getCurrentBranch = useCallback((): string | null => {
    return engine.getCurrentBranch();
  }, [engine]);

  const getRepositoryState = useCallback((): RepositoryState => {
    return engine.getRepositoryState();
  }, [engine]);

  const getFiles = useCallback((): GitFile[] => {
    return engine.getFiles();
  }, [engine]);

  return {
    executeCommand,
    getCurrentBranch,
    getRepositoryState,
    getFiles,
  };
}
