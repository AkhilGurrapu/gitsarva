import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Terminal, Trash2, Maximize2 } from "lucide-react";
import { useGitEngine } from "@/lib/gitEngine";

interface TerminalLine {
  type: 'command' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

interface TerminalPanelProps {
  suggestedCommand?: string;
  onCommandExecuted?: (command: string) => void;
}

export default function TerminalPanel({ suggestedCommand, onCommandExecuted }: TerminalPanelProps) {
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'output', content: 'Welcome to Git Playground! Type your first Git command below.', timestamp: new Date() },
    { type: 'output', content: 'Try starting with: git init', timestamp: new Date() },
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { executeCommand, getCurrentBranch, getRepositoryState } = useGitEngine();

  useEffect(() => {
    // Auto-scroll to bottom when new content is added
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    // Focus input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const addToHistory = (line: TerminalLine) => {
    setHistory(prev => [...prev, line]);
  };

  const handleCommand = async (cmd: string) => {
    if (!cmd.trim()) return;

    // Add command to history
    addToHistory({ type: 'command', content: `$ ${cmd}`, timestamp: new Date() });
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    try {
      const result = await executeCommand(cmd);
      if (result.output) {
        addToHistory({ type: 'output', content: result.output, timestamp: new Date() });
      }
      if (result.error) {
        addToHistory({ type: 'error', content: result.error, timestamp: new Date() });
      }
      
      // Notify parent of command execution
      if (onCommandExecuted) {
        onCommandExecuted(cmd);
      }
    } catch (error) {
      addToHistory({ 
        type: 'error', 
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        timestamp: new Date() 
      });
    }
  };

  // Auto-fill and execute suggested command
  useEffect(() => {
    if (suggestedCommand && suggestedCommand !== command) {
      setCommand(suggestedCommand);
      // Auto-execute the suggested command
      setTimeout(() => {
        handleCommand(suggestedCommand);
        setCommand("");
      }, 500);
    }
  }, [suggestedCommand]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(command);
      setCommand("");
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCommand("");
        } else {
          setHistoryIndex(newIndex);
          setCommand(commandHistory[newIndex]);
        }
      }
    }
  };

  const clearTerminal = () => {
    setHistory([
      { type: 'output', content: 'Terminal cleared. Welcome back to Git Playground!', timestamp: new Date() }
    ]);
  };

  const currentBranch = getCurrentBranch();

  return (
    <div className="flex-1 flex flex-col bg-github-dark">
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Terminal className="h-5 w-5 text-git-green" />
          <span className="text-white font-medium">Terminal</span>
          {currentBranch && (
            <span className="text-xs text-gray-400">
              ({currentBranch})
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearTerminal}
            className="text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Terminal Output */}
      <div 
        ref={terminalRef}
        className="flex-1 p-4 font-mono text-sm overflow-y-auto"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="space-y-1">
          {history.map((line, index) => (
            <div key={index} className={
              line.type === 'command' 
                ? "text-git-green" 
                : line.type === 'error'
                  ? "text-git-red"
                  : "text-gray-300"
            }>
              {line.content}
            </div>
          ))}
        </div>
      </div>

      {/* Command Input */}
      <div className="border-t border-gray-700 p-4">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-git-green font-mono">$</span>
            <Input
              ref={inputRef}
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 bg-transparent text-white font-mono border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
              placeholder="Type your git command here..."
            />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          <span className="text-git-green">Tip:</span> Try commands like "git status", "git add .", or "git commit -m 'message'"
        </div>
      </div>
    </div>
  );
}
