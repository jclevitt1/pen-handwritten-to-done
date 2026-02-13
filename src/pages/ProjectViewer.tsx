import { useAuth } from '@clerk/clerk-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Download, Loader2, ExternalLink, Eye, Code } from 'lucide-react';
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
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { FileTree } from '@/components/FileTree';
import { ChatPanel } from '@/components/ChatPanel';
import { api, Project, ProjectFile } from '@/lib/api';

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
        const result = await api.getDownloadUrl(projectId, selectedFile.path);

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
      <div className="flex-1 flex overflow-hidden">
        {/* File tree sidebar */}
        <div className="w-64 border-r border-border bg-muted/30 overflow-y-auto shrink-0">
          <div className="p-2 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Files
            </span>
          </div>
          <FileTree
            files={files}
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
          />
        </div>

        {/* Editor + Chat pane */}
        <ResizablePanelGroup direction="vertical" className="flex-1">
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
      </div>
    </div>
  );
}
