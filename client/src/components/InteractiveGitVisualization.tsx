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

  const { initialized, commits, files, currentBranch, branches, stagedFiles } = repositoryState;

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

  if (!initialized) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="text-6xl">🚀</div>
          <h3 className="text-xl font-semibold text-github-dark dark:text-foreground">
            Start Your Git Journey
          </h3>
          <p className="text-muted-foreground max-w-md">
            Initialize a Git repository to begin tracking your project's history and collaborate with others.
          </p>
          <Button 
            onClick={() => suggestCommand('git init')}
            className="bg-github-blue hover:bg-github-blue/90 text-white"
          >
            Initialize Repository
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Git Workflow Visualization */}
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-github-dark dark:text-foreground mb-4">
          Git Workflow
        </h3>
        
        <div className="flex items-center justify-between space-x-4">
          {Object.entries(workflowAreas).map(([key, area], index) => {
            const AreaIcon = area.icon;
            const isSelected = selectedArea === key;
            
            return (
              <div key={key} className="flex items-center space-x-3">
                <Card 
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-github-blue' : 'hover:shadow-md'
                  }`}
                  onClick={() => handleAreaClick(key as any)}
                >
                  <CardContent className="p-4 text-center min-w-[120px]">
                    <AreaIcon className={`h-8 w-8 mx-auto mb-2 ${area.color}`} />
                    <div className="text-sm font-medium text-github-dark dark:text-foreground">
                      {area.title}
                    </div>
                    <Badge variant="secondary" className="mt-1">
                      {area.count}
                    </Badge>
                  </CardContent>
                </Card>
                
                {index < Object.keys(workflowAreas).length - 1 && (
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed View of Selected Area */}
      <div className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {(() => {
                const AreaIcon = workflowAreas[selectedArea].icon;
                return <AreaIcon className={`h-5 w-5 ${workflowAreas[selectedArea].color}`} />;
              })()}
              <span>{workflowAreas[selectedArea].title}</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {workflowAreas[selectedArea].description}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Files in selected area */}
            <div>
              <h4 className="text-sm font-medium text-github-dark dark:text-foreground mb-2">
                Files ({workflowAreas[selectedArea].count}):
              </h4>
              
              {workflowAreas[selectedArea].files.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No files in this area</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {workflowAreas[selectedArea].files.map((file, index) => {
                    const { icon: FileIcon, color } = getFileIcon(file.status);
                    return (
                      <div key={index} className="flex items-center space-x-3 p-2 rounded hover:bg-github-bg dark:hover:bg-muted">
                        <FileIcon className={`h-4 w-4 ${color}`} />
                        <span className="text-sm text-github-dark dark:text-foreground flex-1">
                          {file.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {file.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Suggested Actions */}
            <div>
              <h4 className="text-sm font-medium text-github-dark dark:text-foreground mb-2">
                Suggested Actions:
              </h4>
              <div className="space-y-2">
                {workflowAreas[selectedArea].actions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => suggestCommand(action)}
                    className="w-full justify-start text-xs font-mono"
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>

            {/* Commit Timeline for Repository view */}
            {selectedArea === 'repository' && commits.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-github-dark dark:text-foreground mb-3">
                  Commit History:
                </h4>
                <div className="relative">
                  {/* Timeline SVG */}
                  <svg width="100%" height="120" className="mb-4">
                    {/* Horizontal line */}
                    {visualCommits.length > 1 && (
                      <line
                        x1={visualCommits[0].x}
                        y1={visualCommits[0].y}
                        x2={visualCommits[visualCommits.length - 1].x}
                        y2={visualCommits[visualCommits.length - 1].y}
                        stroke="var(--git-green)"
                        strokeWidth="2"
                      />
                    )}
                    
                    {/* Commit nodes */}
                    {visualCommits.map((node) => (
                      <g key={node.id}>
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="8"
                          fill={node.isHead ? "var(--github-blue)" : "var(--git-green)"}
                          stroke="white"
                          strokeWidth="2"
                          className={`cursor-pointer ${node.isHead ? 'animate-pulse' : ''}`}
                          onMouseEnter={() => setHoveredCommit(node.id)}
                          onMouseLeave={() => setHoveredCommit(null)}
                        />
                        <text
                          x={node.x}
                          y={node.y + 25}
                          textAnchor="middle"
                          className="text-xs fill-muted-foreground"
                        >
                          {node.commit.hash.substring(0, 6)}
                        </text>
                      </g>
                    ))}
                    
                    {/* HEAD indicator */}
                    {visualCommits.length > 0 && (
                      <text
                        x={visualCommits[visualCommits.length - 1].x}
                        y={visualCommits[visualCommits.length - 1].y - 15}
                        textAnchor="middle"
                        className="text-xs font-medium fill-github-blue"
                      >
                        HEAD
                      </text>
                    )}
                  </svg>

                  {/* Commit details */}
                  {hoveredCommit && (
                    <Card className="absolute top-0 left-0 z-10 w-64 bg-white dark:bg-card shadow-lg">
                      <CardContent className="p-3">
                        {(() => {
                          const commit = commits.find(c => c.hash === hoveredCommit);
                          return commit ? (
                            <div>
                              <div className="font-mono text-xs text-muted-foreground">
                                {commit.hash.substring(0, 8)}
                              </div>
                              <div className="text-sm font-medium text-github-dark dark:text-foreground">
                                {commit.message}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(commit.date).toLocaleString()}
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}