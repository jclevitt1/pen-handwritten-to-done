import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Send, Loader2, Check, X, Zap, MessageSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { api, ChatEdit, ProjectFile } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  edits?: ChatEdit[];
  applied?: boolean;
  timestamp: Date;
}

interface ChatPanelProps {
  projectId: string;
  currentFile: ProjectFile | null;
  onFileChanged?: () => void;
}

export function ChatPanel({ projectId, currentFile, onFileChanged }: ChatPanelProps) {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isWorking, setIsWorking] = useState(false); // True when async task is processing
  const [autoApply, setAutoApply] = useState(true);
  const [pendingEdits, setPendingEdits] = useState<ChatEdit[] | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Set up API token
  useEffect(() => {
    api.setTokenGetter(() => getToken());
  }, [getToken]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const streamResult = await api.sendChatMessageAsync(projectId, {
        message: userMessage.content,
        context_file: currentFile?.name,
        auto_apply: autoApply,
      });

      if (streamResult.type === 'immediate') {
        // Immediate response (clarification or direct)
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: streamResult.response!.message,
          edits: streamResult.response!.edits,
          applied: streamResult.response!.applied,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        if (streamResult.response!.applied && streamResult.response!.edits.length > 0) {
          onFileChanged?.();
        }
        if (!autoApply && streamResult.response!.edits.length > 0) {
          setPendingEdits(streamResult.response!.edits);
        }
      } else {
        // Async - show preliminary message then poll
        const preliminaryMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: streamResult.preliminaryMessage || 'Working on that...',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, preliminaryMessage]);
        setIsWorking(true);

        // Poll for completion
        const task = await api.pollForCompletion(streamResult.taskId!);
        setIsWorking(false);

        if (task.status === 'FAILED') {
          // Add error message as new message
          const errorMessage: Message = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `Error: ${task.error || 'Task failed'}`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        } else {
          // Add final response as NEW message below preliminary
          const finalResponse = task.result || { message: 'Done!', edits: [], applied: false };
          const finalMessage: Message = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: finalResponse.message,
            edits: finalResponse.edits,
            applied: finalResponse.applied,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, finalMessage]);

          if (finalResponse.applied && finalResponse.edits.length > 0) {
            onFileChanged?.();
          }
          if (!autoApply && finalResponse.edits.length > 0) {
            setPendingEdits(finalResponse.edits);
          }
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyEdits = async () => {
    if (!pendingEdits) return;

    setIsLoading(true);
    try {
      // Send the same request with auto_apply=true to apply
      const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
      if (lastUserMessage) {
        await api.sendChatMessage(projectId, {
          message: lastUserMessage.content,
          context_file: currentFile?.name,
          auto_apply: true,
        });
      }

      // Update the last assistant message to show applied
      setMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1 && m.role === 'assistant' ? { ...m, applied: true } : m
        )
      );

      setPendingEdits(null);
      onFileChanged?.();
    } catch (error) {
      console.error('Failed to apply edits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectEdits = () => {
    setPendingEdits(null);
    // Update the last assistant message
    setMessages((prev) =>
      prev.map((m, i) =>
        i === prev.length - 1 && m.role === 'assistant' ? { ...m, applied: false } : m
      )
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border-t border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Chat</span>
          {currentFile && (
            <Badge variant="secondary" className="text-xs">
              {currentFile.name}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {autoApply ? 'Auto-apply' : 'Ask first'}
          </span>
          <Switch
            checked={autoApply}
            onCheckedChange={setAutoApply}
            className="data-[state=checked]:bg-primary"
          />
          <Zap className={`w-3 h-3 ${autoApply ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">
              What do you want to change about your project?
              {autoApply ? (
                <p className="mt-1 text-xs">Changes will be applied automatically.</p>
              ) : (
                <p className="mt-1 text-xs">You'll review changes before they're applied.</p>
              )}
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {/* Show edit info */}
                {message.edits && message.edits.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2 text-xs">
                      {message.applied ? (
                        <>
                          <Check className="w-3 h-3 text-green-500" />
                          <span className="text-green-500">
                            Applied {message.edits.length} file{message.edits.length > 1 ? 's' : ''}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-muted-foreground">
                            {message.edits.length} file{message.edits.length > 1 ? 's' : ''} to edit:
                          </span>
                        </>
                      )}
                    </div>
                    <div className="mt-1 space-y-1">
                      {message.edits.map((edit, i) => (
                        <code key={i} className="block text-xs text-muted-foreground">
                          {edit.file}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                <span className="text-xs opacity-50 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                {isWorking && (
                  <span className="text-sm text-muted-foreground">Concocting...</span>
                )}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Pending edits actions */}
      {pendingEdits && (
        <div className="px-4 py-2 border-t border-border bg-muted/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {pendingEdits.length} file{pendingEdits.length > 1 ? 's' : ''} ready to apply
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleRejectEdits} disabled={isLoading}>
                <X className="w-3 h-3 mr-1" />
                Reject
              </Button>
              <Button size="sm" onClick={handleApplyEdits} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Check className="w-3 h-3 mr-1" />
                )}
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your project..."
            className="min-h-[60px] max-h-[120px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="self-end"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Press {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Enter to send
        </p>
      </div>
    </div>
  );
}
