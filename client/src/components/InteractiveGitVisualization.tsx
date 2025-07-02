import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  GitBranch, 
  FileText, 
  Plus, 
  ArrowRight, 
  Eye, 
  Archive,
  FolderOpen,
  Users
} from "lucide-react";
import { RepositoryState, GitFile, GitCommit } from "@/lib/gitTypes";

interface InteractiveGitVisualizationProps {
  repositoryState: RepositoryState;
  onCommandSuggestion?: (command: string) => void;
}

interface VisualCommit {
  id: string;
  x: number;
  y: number;
  commit: GitCommit;
  isHead: boolean;
  branch: string;
}

interface FileItem {
  name: string;
  status: 'untracked' | 'staged' | 'committed' | 'modified';
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

export default function InteractiveGitVisualization({ 
  repositoryState, 
  onCommandSuggestion 
}: InteractiveGitVisualizationProps) {
  const [selectedArea, setSelectedArea] = useState<'working' | 'staging' | 'repository'>('working');
  const [hoveredCommit, setHoveredCommit] = useState<string | null>(null);
  const [showChangeIndicator, setShowChangeIndicator] = useState(false);

  const { initialized, commits, files, currentBranch, branches, stagedFiles } = repositoryState;

  // Auto-select the most relevant area based on repository state
  useEffect(() => {
    if (!initialized) {
      setSelectedArea('working');
      return;
    }

    const workingFiles = files.filter(f => f.status === 'untracked' || f.status === 'modified');
    const stagedFilesData = files.filter(f => f.status === 'staged');
    
    // Debug logging to see what's happening
    console.log('🔍 Git Visualization State Update:', {
      workingFiles: workingFiles.length,
      stagedFiles: stagedFilesData.length,
      commits: commits.length,
      files: files.map(f => ({ name: f.name, status: f.status }))
    });
    
    // Show change indicator when repository state changes
    setShowChangeIndicator(true);
    const timer = setTimeout(() => setShowChangeIndicator(false), 2000);
    
    // Priority logic for auto-selection:
    // 1. If files are staged -> highlight staging area
    // 2. If files are in working directory -> highlight working area  
    // 3. If there are commits -> highlight repository
    // 4. Default to working directory
    let newSelectedArea: 'working' | 'staging' | 'repository' = 'working';
    
    if (stagedFilesData.length > 0) {
      newSelectedArea = 'staging';
      console.log('🔵 Auto-selecting STAGING AREA (staged files:', stagedFilesData.length, ')');
    } else if (workingFiles.length > 0) {
      newSelectedArea = 'working';
      console.log('🟡 Auto-selecting WORKING DIRECTORY (working files:', workingFiles.length, ')');
    } else if (commits.length > 0) {
      newSelectedArea = 'repository';
      console.log('🟢 Auto-selecting REPOSITORY (commits:', commits.length, ')');
    } else {
      newSelectedArea = 'working';
      console.log('⚪ Auto-selecting WORKING DIRECTORY (default)');
    }
    
    setSelectedArea(newSelectedArea);
    
    return () => clearTimeout(timer);
  }, [initialized, files, commits]);

  // Create visual representation of the Git workflow
  const workflowAreas = useMemo(() => {
    const workingFiles = files.filter(f => f.status === 'untracked' || f.status === 'modified');
    const stagedFilesData = files.filter(f => f.status === 'staged');
    const committedFiles = files.filter(f => f.status === 'committed');

    return {
      working: {
        title: "Working Directory",
        description: "Your project files - make changes here",
        files: workingFiles,
        count: workingFiles.length,
        icon: FolderOpen,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
        actions: workingFiles.length > 0 ? ["git add ."] : ["Create or edit files"]
      },
      staging: {
        title: "Staging Area",
        description: "Files ready to be committed",
        files: stagedFilesData,
        count: stagedFilesData.length,
        icon: Archive,
        color: "text-blue-600",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        actions: stagedFilesData.length > 0 ? ["git commit -m 'message'"] : ["Stage files with git add"]
      },
      repository: {
        title: "Repository History",
        description: "Permanent record of your project",
        files: committedFiles,
        count: commits.length,
        icon: GitBranch,
        color: "text-green-600",
        bgColor: "bg-green-50 dark:bg-green-900/20",
        actions: commits.length > 0 ? ["git log", "git branch"] : ["Make your first commit"]
      }
    };
  }, [files, commits, stagedFiles]);

  // Visual commits for the timeline
  const visualCommits = useMemo(() => {
    if (commits.length === 0) return [];
    
    return commits.map((commit, index) => ({
      id: commit.hash,
      x: 50 + index * 80,
      y: 60,
      commit,
      isHead: index === commits.length - 1,
      branch: currentBranch || 'main'
    }));
  }, [commits, currentBranch]);

  const getFileIcon = (status: string) => {
    switch (status) {
      case 'untracked': return { icon: Plus, color: 'text-gray-500' };
      case 'modified': return { icon: FileText, color: 'text-yellow-600' };
      case 'staged': return { icon: Archive, color: 'text-blue-600' };
      case 'committed': return { icon: GitBranch, color: 'text-green-600' };
      default: return { icon: FileText, color: 'text-gray-500' };
    }
  };

  const handleAreaClick = (area: 'working' | 'staging' | 'repository') => {
    setSelectedArea(area);
  };

  const suggestCommand = (command: string) => {
    if (onCommandSuggestion) {
      onCommandSuggestion(command);
    }
  };

  // Enhanced animation state for visual feedback
  const [animatingFiles, setAnimatingFiles] = useState<Set<string>>(new Set());
  const [lastCommandFeedback, setLastCommandFeedback] = useState<string>('');
  
  useEffect(() => {
    // Track file transitions for visual feedback
    const changedFiles = files.filter(f => 
      ['staged', 'modified', 'committed'].includes(f.status)
    );
    
    if (changedFiles.length > 0) {
      const fileNames = new Set(changedFiles.map(f => f.name));
      setAnimatingFiles(fileNames);
      
      // Show contextual feedback
      const stagedCount = files.filter(f => f.status === 'staged').length;
      const committedCount = commits.length;
      
      if (stagedCount > 0) {
        setLastCommandFeedback(`✨ ${stagedCount} file(s) staged - ready to commit!`);
      } else if (committedCount > 0) {
        setLastCommandFeedback(`🎉 Commit created! Repository history updated.`);
      }
      
      // Clear animation state after delay
      const timer = setTimeout(() => {
        setAnimatingFiles(new Set());
        setLastCommandFeedback('');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [files, commits]);

  if (!initialized) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="text-center space-y-3 sm:space-y-4 max-w-sm">
          <div className="text-4xl sm:text-6xl">🚀</div>
          <h3 className="text-lg sm:text-xl font-semibold text-github-dark dark:text-foreground">
            Start Your Git Journey
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            Initialize a Git repository to begin tracking your project's history and collaborate with others.
          </p>
          <Button 
            onClick={() => suggestCommand('git init')}
            className="bg-github-blue hover:bg-github-blue/90 text-white w-full sm:w-auto"
          >
            Initialize Repository
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden" data-walkthrough="git-visualization">
      {/* Git Workflow Visualization */}
      <div className="p-4 sm:p-5 lg:p-6 border-b border-border overflow-hidden">
        <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-github-dark dark:text-foreground">
              Git Workflow
            </h3>
            {showChangeIndicator && (
              <div className="flex items-center gap-1 bg-github-blue/10 text-github-blue px-2 py-1 rounded-full text-xs animate-pulse">
                ✨ Updated!
              </div>
            )}
          </div>
          
          {/* Real-time Command Feedback */}
          {lastCommandFeedback && (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs border border-green-200 dark:border-green-800 animate-in slide-in-from-right">
              {lastCommandFeedback}
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2 lg:gap-3 overflow-hidden w-full px-2 sm:px-1 lg:px-0">
          {Object.entries(workflowAreas).map(([key, area], index) => {
            const AreaIcon = area.icon;
            const isSelected = selectedArea === key;
            
            return (
              <div key={key} className="flex items-center justify-center flex-1 min-w-0">
                <Card 
                  className={`cursor-pointer transition-all w-full max-w-[90px] sm:max-w-[110px] lg:max-w-[130px] ${
                    isSelected 
                      ? 'ring-2 ring-github-blue shadow-lg scale-105 bg-github-blue/5 dark:bg-github-blue/10' 
                      : 'hover:shadow-md hover:scale-102'
                  }`}
                  onClick={() => handleAreaClick(key as any)}
                >
                  <CardContent className={`p-1 sm:p-1.5 lg:p-2 text-center ${isSelected ? area.bgColor : ''}`}>
                    <AreaIcon className={`h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mx-auto mb-1 ${
                      isSelected ? area.color + ' animate-pulse' : area.color
                    }`} />
                    <div className={`text-xs font-medium truncate ${
                      isSelected ? 'text-github-blue font-bold' : 'text-github-dark dark:text-foreground'
                    }`}>
                      {area.title.replace('Directory', 'Dir').replace('Staging', 'Stage')}
                    </div>
                    <Badge 
                      variant={isSelected ? "default" : "secondary"} 
                      className={`mt-0.5 text-xs px-1 ${
                        isSelected ? 'bg-github-blue text-white animate-pulse' : ''
                      }`}
                    >
                      {area.count}
                    </Badge>
                  </CardContent>
                </Card>
                
                {index < Object.keys(workflowAreas).length - 1 && (
                  <ArrowRight className="hidden sm:block h-2 w-2 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-muted-foreground mx-0.5 sm:mx-1 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed View of Selected Area */}
      <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-hidden">
        <Card className="h-full overflow-hidden">
          <CardHeader className="pb-2 sm:pb-3 lg:pb-4 px-3 sm:px-4 lg:px-6">
            <CardTitle className="flex items-center gap-2 min-w-0 text-sm sm:text-base">
              {(() => {
                const AreaIcon = workflowAreas[selectedArea].icon;
                return <AreaIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${workflowAreas[selectedArea].color} flex-shrink-0`} />;
              })()}
              <span className="truncate">{workflowAreas[selectedArea].title}</span>
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {workflowAreas[selectedArea].description}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-2 sm:space-y-3 lg:space-y-4 overflow-y-auto max-h-[calc(100vh-16rem)] sm:max-h-[calc(100vh-18rem)] lg:max-h-[calc(100vh-20rem)] px-3 sm:px-4 lg:px-6">
            {/* Files in selected area */}
            <div className="overflow-hidden">
              <h4 className="text-xs sm:text-sm font-medium text-github-dark dark:text-foreground mb-2">
                Files ({workflowAreas[selectedArea].count}):
              </h4>
              
              {workflowAreas[selectedArea].files.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-muted-foreground">
                  <Eye className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs sm:text-sm">No files in this area</p>
                </div>
              ) : (
                <div className="space-y-1 sm:space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                  {workflowAreas[selectedArea].files.map((file, index) => {
                    const { icon: FileIcon, color } = getFileIcon(file.status);
                    const isAnimating = animatingFiles.has(file.name);
                    
                    return (
                      <div 
                        key={index} 
                        className={`flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded hover:bg-github-bg dark:hover:bg-muted min-w-0 transition-all ${
                          isAnimating ? 'ring-2 ring-github-blue bg-github-blue/5 scale-102 animate-pulse' : ''
                        }`}
                      >
                        <FileIcon className={`h-3 w-3 sm:h-4 sm:w-4 ${color} flex-shrink-0 ${
                          isAnimating ? 'animate-bounce' : ''
                        }`} />
                        <span className="text-xs sm:text-sm text-github-dark dark:text-foreground flex-1 truncate min-w-0">
                          {file.name}
                        </span>
                        <Badge variant={isAnimating ? "default" : "outline"} className={`text-xs flex-shrink-0 ${
                          isAnimating ? 'bg-github-blue text-white animate-pulse' : ''
                        }`}>
                          {file.status}
                        </Badge>
                        {isAnimating && (
                          <div className="h-2 w-2 bg-github-blue rounded-full animate-ping flex-shrink-0"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Suggested Actions */}
            <div className="overflow-hidden">
              <h4 className="text-xs sm:text-sm font-medium text-github-dark dark:text-foreground mb-2">
                Suggested Actions:
              </h4>
              <div className="space-y-1 sm:space-y-2 max-h-32 overflow-y-auto">
                {workflowAreas[selectedArea].actions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => suggestCommand(action)}
                    className="w-full justify-start text-xs font-mono h-8 sm:h-9 px-2 sm:px-3"
                  >
                    <span className="truncate">{action}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Enhanced Interactive Commit History for Repository view */}
            {selectedArea === 'repository' && (
              <div className="overflow-hidden">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h4 className="text-xs sm:text-sm font-medium text-github-dark dark:text-foreground">
                    Repository History:
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Branch: <span className="font-mono text-github-blue">{currentBranch || 'main'}</span></span>
                    {commits.length > 0 && (
                      <span>HEAD: <span className="font-mono text-github-blue">{commits[commits.length - 1]?.hash.substring(0, 7)}</span></span>
                    )}
                  </div>
                </div>

                {commits.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No commits yet</p>
                    <p className="text-xs">Make your first commit to see the history!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Enhanced Timeline Visualization */}
                    <div className="relative overflow-x-auto bg-gradient-to-r from-github-bg to-blue-50 dark:from-muted to-blue-950/20 p-4 rounded-lg">
                      <svg width="100%" height="120" className="min-w-[400px]">
                        {/* Branch line */}
                        {visualCommits.length > 1 && (
                          <line
                            x1={visualCommits[0].x}
                            y1={visualCommits[0].y}
                            x2={visualCommits[visualCommits.length - 1].x}
                            y2={visualCommits[visualCommits.length - 1].y}
                            stroke="url(#gradient)"
                            strokeWidth="3"
                            strokeDasharray="0"
                          />
                        )}
                        
                        {/* Gradient definition */}
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="var(--git-green)" />
                            <stop offset="100%" stopColor="var(--github-blue)" />
                          </linearGradient>
                        </defs>
                        
                        {/* Enhanced commit nodes */}
                        {visualCommits.map((node, index) => (
                          <g key={node.id}>
                            {/* Commit circle */}
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={node.isHead ? "12" : "10"}
                              fill={node.isHead ? "var(--github-blue)" : "var(--git-green)"}
                              stroke="white"
                              strokeWidth="3"
                              className={`cursor-pointer transition-all ${
                                node.isHead ? 'animate-pulse drop-shadow-lg' : 'hover:scale-110'
                              } ${hoveredCommit === node.id ? 'scale-125' : ''}`}
                              onMouseEnter={() => setHoveredCommit(node.id)}
                              onMouseLeave={() => setHoveredCommit(null)}
                              onClick={() => suggestCommand(`git show ${node.commit.hash.substring(0, 7)}`)}
                            />
                            
                            {/* Commit hash */}
                            <text
                              x={node.x}
                              y={node.y + 30}
                              textAnchor="middle"
                              className="text-xs font-mono fill-muted-foreground hover:fill-github-blue cursor-pointer"
                              onClick={() => suggestCommand(`git show ${node.commit.hash.substring(0, 7)}`)}
                            >
                              {node.commit.hash.substring(0, 7)}
                            </text>
                            
                            {/* Commit number */}
                            <text
                              x={node.x}
                              y={node.y - 20}
                              textAnchor="middle"
                              className="text-xs font-medium fill-github-dark dark:fill-foreground"
                            >
                              #{index + 1}
                            </text>
                          </g>
                        ))}
                        
                        {/* Enhanced HEAD indicator */}
                        {visualCommits.length > 0 && (
                          <g>
                            <rect
                              x={visualCommits[visualCommits.length - 1].x - 15}
                              y={visualCommits[visualCommits.length - 1].y - 45}
                              width="30"
                              height="18"
                              rx="9"
                              fill="var(--github-blue)"
                              className="animate-pulse"
                            />
                            <text
                              x={visualCommits[visualCommits.length - 1].x}
                              y={visualCommits[visualCommits.length - 1].y - 32}
                              textAnchor="middle"
                              className="text-xs font-bold fill-white"
                            >
                              HEAD
                            </text>
                          </g>
                        )}
                      </svg>
                    </div>

                    {/* Interactive Commit Details */}
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {commits.slice().reverse().map((commit, index) => {
                        const isHead = index === 0;
                        const isHovered = hoveredCommit === commit.hash;
                        return (
                          <Card 
                            key={commit.hash}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              isHead ? 'ring-2 ring-github-blue bg-github-blue/5' : ''
                            } ${isHovered ? 'shadow-lg scale-105' : ''}`}
                            onMouseEnter={() => setHoveredCommit(commit.hash)}
                            onMouseLeave={() => setHoveredCommit(null)}
                            onClick={() => suggestCommand(`git show ${commit.hash.substring(0, 7)}`)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono text-xs text-muted-foreground">
                                      {commit.hash.substring(0, 8)}
                                    </span>
                                    {isHead && (
                                      <Badge variant="default" className="text-xs px-1.5 py-0.5 bg-github-blue">
                                        HEAD
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm font-medium text-github-dark dark:text-foreground truncate">
                                    {commit.message}
                                  </p>
                                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                    <span>{commit.author}</span>
                                    <span>{new Date(commit.date).toLocaleString()}</span>
                                    <span>{commit.files.length} file{commit.files.length !== 1 ? 's' : ''}</span>
                                  </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              {/* Files changed in this commit */}
                              {commit.files.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-border/50">
                                  <div className="flex flex-wrap gap-1">
                                    {commit.files.map((fileName, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {fileName}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {/* Interactive Commands */}
                    <div className="pt-2 border-t border-border">
                      <h5 className="text-xs font-medium text-github-dark dark:text-foreground mb-2">
                        🔍 Explore History:
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => suggestCommand('git log --oneline')}
                          className="text-xs h-7"
                        >
                          📋 git log
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => suggestCommand(`git show ${commits[commits.length - 1]?.hash.substring(0, 7)}`)}
                          className="text-xs h-7"
                          disabled={commits.length === 0}
                        >
                          👁️ show HEAD
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => suggestCommand('git branch')}
                          className="text-xs h-7"
                        >
                          🌳 branches
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}