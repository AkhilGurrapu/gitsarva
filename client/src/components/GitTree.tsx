import { useMemo } from "react";
import { GitCommit, RepositoryState } from "@/lib/gitTypes";

interface GitTreeProps {
  repositoryState: RepositoryState;
}

export default function GitTree({ repositoryState }: GitTreeProps) {
  const { commits, branches, currentBranch } = repositoryState;

  const treeData = useMemo(() => {
    if (commits.length === 0) {
      return {
        nodes: [],
        branches: [],
        currentBranch: null,
      };
    }

    // Create nodes for commits
    const nodes = commits.map((commit, index) => ({
      id: commit.hash,
      x: 100 + index * 120,
      y: 150,
      commit,
      isHead: commit.hash === commits[commits.length - 1]?.hash,
    }));

    return {
      nodes,
      branches: Object.keys(branches),
      currentBranch,
    };
  }, [commits, branches, currentBranch]);

  if (commits.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 text-muted-foreground">
        <div className="text-6xl">🌱</div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-github-dark dark:text-foreground mb-2">
            No Git History Yet
          </h3>
          <p className="text-sm">
            Initialize a repository and make your first commit to see the git tree!
          </p>
          <div className="mt-4 text-xs bg-github-bg dark:bg-muted p-3 rounded-lg max-w-md">
            <div className="font-medium mb-1">Try these commands:</div>
            <div className="space-y-1">
              <div className="font-mono">git init</div>
              <div className="font-mono">git add README.md</div>
              <div className="font-mono">git commit -m "Initial commit"</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-8">
      {/* Git Graph Visualization */}
      <div className="relative">
        <svg width="600" height="300" className="border border-border rounded-lg bg-github-bg dark:bg-muted/20">
          {/* Branch lines */}
          {treeData.nodes.length > 1 && (
            <line
              x1={treeData.nodes[0].x}
              y1={treeData.nodes[0].y}
              x2={treeData.nodes[treeData.nodes.length - 1].x}
              y2={treeData.nodes[treeData.nodes.length - 1].y}
              stroke="var(--git-green)"
              strokeWidth="3"
              strokeDasharray="0"
            />
          )}
          
          {/* Commit nodes */}
          {treeData.nodes.map((node, index) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r="12"
                fill={node.isHead ? "var(--github-blue)" : "var(--git-green)"}
                stroke="white"
                strokeWidth="3"
                className={node.isHead ? "animate-pulse" : ""}
              />
              <text
                x={node.x}
                y={node.y + 35}
                textAnchor="middle"
                className="text-xs font-mono fill-muted-foreground"
              >
                {node.commit.hash.substring(0, 7)}
              </text>
              <text
                x={node.x}
                y={node.y + 50}
                textAnchor="middle"
                className="text-xs fill-muted-foreground max-w-20"
              >
                {node.commit.message.length > 15 
                  ? node.commit.message.substring(0, 15) + "..." 
                  : node.commit.message}
              </text>
            </g>
          ))}

          {/* HEAD indicator */}
          {treeData.nodes.length > 0 && (
            <text
              x={treeData.nodes[treeData.nodes.length - 1].x}
              y={treeData.nodes[treeData.nodes.length - 1].y - 25}
              textAnchor="middle"
              className="text-xs font-medium fill-github-blue"
            >
              HEAD
            </text>
          )}
        </svg>
      </div>

      {/* Branch indicators */}
      <div className="flex items-center space-x-6">
        {treeData.branches.map((branch) => (
          <div key={branch} className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              branch === treeData.currentBranch ? 'bg-github-blue' : 'bg-git-green'
            }`} />
            <span className="text-sm text-github-dark dark:text-foreground">{branch}</span>
            {branch === treeData.currentBranch && (
              <>
                <span className="text-xs text-muted-foreground">←</span>
                <span className="text-xs text-muted-foreground">current</span>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Repository info */}
      <div className="bg-github-bg dark:bg-muted rounded-lg p-4 w-full max-w-md">
        <h4 className="font-medium text-github-dark dark:text-foreground mb-3">
          Repository Timeline
        </h4>
        <div className="space-y-2">
          {commits.slice().reverse().map((commit, index) => (
            <div key={commit.hash} className="flex items-center space-x-3 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                index === 0 ? 'bg-github-blue' : 'bg-git-green'
              }`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">
                    {commit.hash.substring(0, 7)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(commit.date).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-github-dark dark:text-foreground">
                  {commit.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
