import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GitBranch, Folder, FileText, File } from "lucide-react";
import GitTree from "./GitTree";
import { useGitEngine } from "@/lib/gitEngine";

export default function VisualizationPanel() {
  const [view, setView] = useState<'graph' | 'tree'>('graph');
  const { getRepositoryState, getFiles } = useGitEngine();
  
  const repoState = getRepositoryState();
  const files = getFiles();

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-card">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center space-x-2">
          <GitBranch className="h-5 w-5 text-github-blue" />
          <span className="text-github-dark dark:text-foreground font-medium">
            Repository Visualization
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={view === 'tree' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('tree')}
            className="text-xs"
          >
            Tree View
          </Button>
          <Button
            variant={view === 'graph' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('graph')}
            className="text-xs bg-github-blue hover:bg-github-blue/90 text-white"
          >
            Graph View
          </Button>
        </div>
      </div>

      {/* Git Tree Visualization */}
      <div className="flex-1 p-6 overflow-hidden">
        {view === 'graph' ? (
          <GitTree repositoryState={repoState} />
        ) : (
          <div className="h-full flex flex-col">
            <h3 className="text-lg font-semibold text-github-dark dark:text-foreground mb-4">
              File Tree
            </h3>
            <div className="flex-1 overflow-y-auto">
              {files.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Folder className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No files in repository</p>
                  <p className="text-sm">Initialize a repository and add some files!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm p-2 rounded hover:bg-github-bg dark:hover:bg-muted">
                      <File className="h-4 w-4 text-blue-500" />
                      <span className="text-github-dark dark:text-foreground">{file.name}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        file.status === 'committed' 
                          ? 'text-success-green bg-green-50 dark:bg-green-900/20' 
                          : file.status === 'staged'
                            ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                            : 'text-git-red bg-red-50 dark:bg-red-900/20'
                      }`}>
                        {file.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Repository Status */}
      <div className="border-t border-border p-4">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium text-github-dark dark:text-foreground mb-3">
              Repository Status
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Branch:</span>
                <span className="font-mono text-github-blue">
                  {repoState.currentBranch || 'No branch'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Commits:</span>
                <span className="font-mono text-github-dark dark:text-foreground">
                  {repoState.commits.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Working Directory:</span>
                <span className={`font-medium ${
                  repoState.workingDirectory === 'clean' 
                    ? 'text-success-green' 
                    : 'text-yellow-600'
                }`}>
                  {repoState.workingDirectory === 'clean' ? 'Clean' : 'Modified'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Staged Changes:</span>
                <span className="text-muted-foreground">
                  {repoState.stagedFiles.length > 0 ? repoState.stagedFiles.length : 'None'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Working Directory Files */}
        <div className="mt-4">
          <h4 className="font-medium text-github-dark dark:text-foreground mb-3 flex items-center">
            <Folder className="h-4 w-4 text-yellow-500 mr-2" />
            Working Directory
          </h4>
          <div className="space-y-2">
            {files.length === 0 ? (
              <p className="text-sm text-muted-foreground">No files yet</p>
            ) : (
              files.map((file, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-github-dark dark:text-foreground">{file.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    file.status === 'committed' 
                      ? 'text-success-green bg-green-50 dark:bg-green-900/20' 
                      : file.status === 'staged'
                        ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'text-git-red bg-red-50 dark:bg-red-900/20'
                  }`}>
                    {file.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
