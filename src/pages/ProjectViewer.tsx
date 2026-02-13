import { useAuth } from '@clerk/clerk-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Download, Loader2, ExternalLink, Eye, Code, FolderPlus } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FileTree } from '@/components/FileTree';
import { ChatPanel } from '@/components/ChatPanel';
import { api, ProjectFile } from '@/lib/api';

// Check if file is markdown
function isMarkdownFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext === 'md' || ext === 'markdown';
}

// Check if file is a PDF
function isPdfFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext === 'pdf';
}

// Get language extension based on file extension
function getLanguageExtension(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return javascript({ jsx: true, typescript: ext?.includes('t') });
    case 'py':
      return python();
    case 'html':
      return html();
    case 'css':
    case 'scss':
      return css();
    case 'json':
      return json();
    case 'md':
    case 'markdown':
      return markdown();
    default:
      return [];
  }
}

export default function ProjectViewer() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null); // For PDF viewing
  const [loadingContent, setLoadingContent] = useState(false);
  const [fileVersion, setFileVersion] = useState(0); // For forcing re-fetch after chat edits
  const [showRendered, setShowRendered] = useState(true); // Toggle for markdown rendering

  // Dialog state
  const [renameDialog, setRenameDialog] = useState<{ file: ProjectFile; newName: string } | null>(null);
  const [newFolderDialog, setNewFolderDialog] = useState<{ parentPath: string; name: string } | null>(null);
  const [newFileDialog, setNewFileDialog] = useState<{ parentPath: string; name: string } | null>(null);
  const [deleteFileConfirm, setDeleteFileConfirm] = useState<ProjectFile | null>(null);
  const [deleteFolderConfirm, setDeleteFolderConfirm] = useState<string | null>(null);

  // Set up API token getter
  useEffect(() => {
    api.setTokenGetter(() => getToken());
  }, [getToken]);

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in');
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Fetch project details
  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.getProject(projectId!),
    enabled: isSignedIn && !!projectId,
  });

  // Fetch project files
  const { data: filesData, isLoading: loadingFiles } = useQuery({
    queryKey: ['projectFiles', projectId],
    queryFn: () => api.listProjectFiles(projectId!),
    enabled: isSignedIn && !!projectId,
  });

  const files = filesData?.files ?? [];

  // Load file content when selected (or when fileVersion changes from chat edits)
  useEffect(() => {
    if (!selectedFile || !projectId) return;

    const loadContent = async () => {
      setLoadingContent(true);
      setPdfUrl(null);
      setFileContent('');

      try {
        // Use path (full S3 key) for download, not just name
        // For PDFs, use 'view' mode so they display inline instead of downloading
        const mode = isPdfFile(selectedFile.name) ? 'view' : 'download';
        const result = await api.getDownloadUrl(projectId, selectedFile.path, mode);

        // For PDFs, just use the URL directly in an iframe
        if (isPdfFile(selectedFile.name)) {
          setPdfUrl(result.download_url);
        } else {
          // For text files, fetch the content
          const response = await fetch(result.download_url);
          const text = await response.text();
          setFileContent(text);
        }
      } catch (e) {
        console.error('Failed to load file content:', e);
        setFileContent('// Failed to load file content');
      }
      setLoadingContent(false);
    };

    loadContent();
  }, [selectedFile, projectId, fileVersion]);

  // Callback when chat modifies files
  const handleFileChanged = () => {
    // Invalidate file list query to refresh
    queryClient.invalidateQueries({ queryKey: ['projectFiles', projectId] });
    // Bump version to re-fetch current file content
    setFileVersion((v) => v + 1);
  };

  // File/folder operation handlers
  const handleDeleteFile = async () => {
    if (!deleteFileConfirm || !projectId) return;
    try {
      await api.deleteFile(projectId, deleteFileConfirm.path);
      queryClient.invalidateQueries({ queryKey: ['projectFiles', projectId] });
      if (selectedFile?.path === deleteFileConfirm.path) {
        setSelectedFile(null);
      }
    } catch (e) {
      console.error('Failed to delete file:', e);
    }
    setDeleteFileConfirm(null);
  };

  const handleRenameFile = async () => {
    if (!renameDialog || !projectId) return;
    try {
      // Get directory from current path
      const dir = renameDialog.file.path.substring(0, renameDialog.file.path.lastIndexOf('/') + 1);
      const newPath = dir + renameDialog.newName;
      await api.moveFile(projectId, renameDialog.file.path, newPath);
      queryClient.invalidateQueries({ queryKey: ['projectFiles', projectId] });
      // Update selection if needed
      if (selectedFile?.path === renameDialog.file.path) {
        setSelectedFile(null);
      }
    } catch (e) {
      console.error('Failed to rename file:', e);
    }
    setRenameDialog(null);
  };

  const handleCreateFolder = async () => {
    if (!newFolderDialog || !projectId) return;
    try {
      const fullPath = newFolderDialog.parentPath
        ? `${newFolderDialog.parentPath}/${newFolderDialog.name}`
        : newFolderDialog.name;
      await api.createFolder(projectId, fullPath);
      queryClient.invalidateQueries({ queryKey: ['projectFiles', projectId] });
    } catch (e) {
      console.error('Failed to create folder:', e);
    }
    setNewFolderDialog(null);
  };

  const handleCreateFile = async () => {
    if (!newFileDialog || !projectId) return;
    try {
      const fullPath = newFileDialog.parentPath
        ? `${newFileDialog.parentPath}/${newFileDialog.name}`
        : newFileDialog.name;
      // Create empty file
      await api.uploadProjectFiles(projectId, [
        { path: fullPath, content_base64: btoa(''), mimeType: 'text/plain' },
      ]);
      queryClient.invalidateQueries({ queryKey: ['projectFiles', projectId] });
    } catch (e) {
      console.error('Failed to create file:', e);
    }
    setNewFileDialog(null);
  };

  const handleDeleteFolder = async () => {
    if (!deleteFolderConfirm || !projectId) return;
    try {
      await api.deleteFolder(projectId, deleteFolderConfirm);
      queryClient.invalidateQueries({ queryKey: ['projectFiles', projectId] });
      // Clear selection if it was inside deleted folder
      if (selectedFile?.path.startsWith(deleteFolderConfirm + '/')) {
        setSelectedFile(null);
      }
    } catch (e) {
      console.error('Failed to delete folder:', e);
    }
    setDeleteFolderConfirm(null);
  };

  // Handle drag-drop file move
  const handleMoveFileToFolder = async (fromPath: string, toFolderPath: string) => {
    if (!projectId) return;
    try {
      const fileName = fromPath.split('/').pop() || fromPath;
      const newPath = toFolderPath ? `${toFolderPath}/${fileName}` : fileName;
      await api.moveFile(projectId, fromPath, newPath);
      queryClient.invalidateQueries({ queryKey: ['projectFiles', projectId] });
      // Update selection if moved file was selected
      if (selectedFile?.name === fromPath) {
        setSelectedFile(null);
      }
    } catch (e) {
      console.error('Failed to move file:', e);
    }
  };

  // Auto-select first file
  useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      // Prefer README or main file
      const readme = files.find(f => f.name.toLowerCase().includes('readme'));
      const main = files.find(f => f.name.includes('main.'));
      setSelectedFile(readme || main || files[0]);
    }
  }, [files, selectedFile]);

  // Handle download zip
  const handleDownloadZip = async () => {
    if (!projectId) return;
    try {
      const result = await api.getDownloadZipUrl(projectId);
      const link = document.createElement('a');
      link.href = result.download_url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Failed to download zip:', e);
    }
  };

  if (!isLoaded || loadingProject || loadingFiles) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Project not found</h2>
          <Link to="/dashboard" className="text-primary hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg shrink-0">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="font-semibold">{project.name}</h1>
              {project.description && (
                <p className="text-xs text-muted-foreground truncate max-w-md">
                  {project.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {files.length} files
            </span>
            <Button variant="outline" size="sm" onClick={handleDownloadZip}>
              <Download className="w-4 h-4 mr-2" />
              Download Zip
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* File tree sidebar */}
        <ResizablePanel defaultSize={20} minSize={10} maxSize={40}>
          <div className="h-full border-r border-border bg-muted/30 overflow-y-auto">
            <div className="p-2 border-b border-border flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Files
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setNewFolderDialog({ parentPath: '', name: '' })}
                title="New folder"
              >
                <FolderPlus className="h-4 w-4" />
              </Button>
            </div>
            <FileTree
              files={files}
              selectedFile={selectedFile}
              onSelectFile={setSelectedFile}
              onDeleteFile={(file) => setDeleteFileConfirm(file)}
              onRenameFile={(file) => setRenameDialog({ file, newName: file.name.split('/').pop() || file.name })}
              onMoveFile={handleMoveFileToFolder}
              onCreateFile={(parentPath) => setNewFileDialog({ parentPath, name: '' })}
              onCreateFolder={(parentPath) => setNewFolderDialog({ parentPath, name: '' })}
              onDeleteFolder={(folderPath) => setDeleteFolderConfirm(folderPath)}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Editor + Chat pane */}
        <ResizablePanel defaultSize={80}>
          <ResizablePanelGroup direction="vertical" className="h-full">
          {/* Editor panel */}
          <ResizablePanel defaultSize={70} minSize={30}>
            <div className="h-full flex flex-col overflow-hidden">
              {selectedFile ? (
                <>
                  {/* File tab */}
                  <div className="h-10 border-b border-border bg-muted/30 flex items-center px-4 shrink-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                      {isMarkdownFile(selectedFile.name) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowRendered(!showRendered)}
                          className="h-6 px-2 text-xs"
                        >
                          {showRendered ? (
                            <>
                              <Code className="w-3 h-3 mr-1" />
                              Raw
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              Preview
                            </>
                          )}
                        </Button>
                      )}
                      {isPdfFile(selectedFile.name) && pdfUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(pdfUrl, '_blank')}
                          className="h-6 px-2 text-xs"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Open in new tab
                        </Button>
                      )}
                      {selectedFile.size && (
                        <span className="text-xs text-muted-foreground">
                          ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Code editor, Markdown renderer, or PDF viewer */}
                  <div className="flex-1 overflow-hidden">
                    {loadingContent ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : isPdfFile(selectedFile.name) && pdfUrl ? (
                      <iframe
                        src={pdfUrl}
                        className="w-full h-full border-0"
                        title={selectedFile.name}
                      />
                    ) : isMarkdownFile(selectedFile.name) && showRendered ? (
                      <div className="h-full overflow-auto p-8 bg-background">
                        <article className="prose prose-invert prose-headings:font-semibold prose-headings:text-foreground prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8 prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-6 prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-4 prose-p:text-muted-foreground prose-p:leading-7 prose-p:mb-4 prose-li:text-muted-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-pre:border-border max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                          >
                            {fileContent}
                          </ReactMarkdown>
                        </article>
                      </div>
                    ) : (
                      <CodeMirror
                        value={fileContent}
                        height="100%"
                        extensions={[getLanguageExtension(selectedFile.name)]}
                        editable={false}
                        theme="dark"
                        className="h-full"
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Select a file to view
                </div>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Chat panel */}
          <ResizablePanel defaultSize={30} minSize={20}>
            <ChatPanel
              projectId={projectId!}
              currentFile={selectedFile}
              onFileChanged={handleFileChanged}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Rename File Dialog */}
      <Dialog open={!!renameDialog} onOpenChange={() => setRenameDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
            <DialogDescription>Enter a new name for the file.</DialogDescription>
          </DialogHeader>
          <Input
            value={renameDialog?.newName || ''}
            onChange={(e) =>
              setRenameDialog(renameDialog ? { ...renameDialog, newName: e.target.value } : null)
            }
            placeholder="filename.txt"
            onKeyDown={(e) => e.key === 'Enter' && handleRenameFile()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleRenameFile}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={!!newFolderDialog} onOpenChange={() => setNewFolderDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
            <DialogDescription>
              Create a new folder{newFolderDialog?.parentPath ? ` in ${newFolderDialog.parentPath}` : ''}.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newFolderDialog?.name || ''}
            onChange={(e) =>
              setNewFolderDialog(newFolderDialog ? { ...newFolderDialog, name: e.target.value } : null)
            }
            placeholder="folder-name"
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New File Dialog */}
      <Dialog open={!!newFileDialog} onOpenChange={() => setNewFileDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New File</DialogTitle>
            <DialogDescription>
              Create a new file{newFileDialog?.parentPath ? ` in ${newFileDialog.parentPath}` : ''}.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newFileDialog?.name || ''}
            onChange={(e) =>
              setNewFileDialog(newFileDialog ? { ...newFileDialog, name: e.target.value } : null)
            }
            placeholder="filename.txt"
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFileDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFile}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete File Confirmation */}
      <AlertDialog open={!!deleteFileConfirm} onOpenChange={() => setDeleteFileConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteFileConfirm?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFile} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Folder Confirmation */}
      <AlertDialog open={!!deleteFolderConfirm} onOpenChange={() => setDeleteFolderConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the folder "{deleteFolderConfirm}" and all its contents? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFolder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
