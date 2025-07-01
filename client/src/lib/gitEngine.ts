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
      switch (subcommand) {
        case 'init':
          return this.init();
        case 'status':
          return this.status();
        case 'add':
          return this.add(args);
        case 'commit':
          return this.commit(args);
        case 'branch':
          return this.branch(args);
        case 'checkout':
          return this.checkout(args);
        case 'log':
          return this.log(args);
        case 'diff':
          return this.diff(args);
        default:
          return { 
            output: '', 
            error: `Unknown git command: ${subcommand}. Try 'git status' or 'git help'.` 
          };
      }
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
      // Add all files
      const unstaged = this.state.files.filter(f => f.status === 'untracked' || f.status === 'modified');
      unstaged.forEach(f => {
        f.status = 'staged';
      });
      this.updateWorkingDirectoryStatus();
      return { 
        output: unstaged.length > 0 ? `Added ${unstaged.length} file(s) to staging area.` : 'No files to add.', 
        error: '' 
      };
    } else {
      // Add specific file
      const file = this.state.files.find(f => f.name === target);
      if (!file) {
        return { 
          output: '', 
          error: `pathspec '${target}' did not match any files` 
        };
      }
      
      if (file.status === 'staged' || file.status === 'committed') {
        return { 
          output: `File '${target}' is already staged or committed.`, 
          error: '' 
        };
      }
      
      file.status = 'staged';
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

    this.state.commits.push(commit);
    if (this.state.currentBranch) {
      this.state.branches[this.state.currentBranch] = [...this.state.commits];
    }

    // Update file statuses
    stagedFiles.forEach(f => {
      f.status = 'committed';
    });

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

    let output = '';
    this.state.commits.slice().reverse().forEach(commit => {
      output += `commit ${commit.hash}\n`;
      output += `Author: ${commit.author}\n`;
      output += `Date: ${new Date(commit.date).toLocaleString()}\n\n`;
      output += `    ${commit.message}\n\n`;
    });

    return { output, error: '' };
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
    return { ...this.state };
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
    const result = await engine.executeCommand(command);
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
