export interface GitCommit {
  hash: string;
  message: string;
  date: string;
  author: string;
  files: string[];
}

export interface GitBranch {
  name: string;
  commits: GitCommit[];
  head: string;
}

export interface GitFile {
  name: string;
  content: string;
  status: 'untracked' | 'staged' | 'committed' | 'modified';
}

export interface RepositoryState {
  initialized: boolean;
  currentBranch: string | null;
  branches: Record<string, GitCommit[]>;
  commits: GitCommit[];
  stagedFiles: string[];
  workingDirectory: 'clean' | 'modified';
  files: GitFile[];
}

export interface CommandResult {
  output: string;
  error: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'star' | 'target' | 'award';
  unlockedAt: Date;
}

export interface LessonProgress {
  lessonId: number;
  completed: boolean;
  completedAt?: Date;
  score?: number;
}
