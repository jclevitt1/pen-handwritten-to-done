import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Loader2, Pencil, FolderUp } from 'lucide-react';
import { api } from '@/lib/api';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (projectId: string) => void;
}

// Helper to convert file to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

export function NewProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
}: NewProjectModalProps) {
  const [activeTab, setActiveTab] = useState<'notes' | 'upload'>('notes');
  const [projectName, setProjectName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Notes tab state
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Upload tab state
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  const resetState = () => {
    setProjectName('');
    setPdfFile(null);
    setUploadFiles([]);
    setError(null);
    setStatusMessage(null);
    setIsLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleNotesSubmit = async () => {
    if (!pdfFile || !projectName.trim()) return;

    setIsLoading(true);
    setError(null);
    setStatusMessage('Uploading PDF...');

    try {
      // 1. Upload PDF
      const base64 = await fileToBase64(pdfFile);
      const uploadResult = await api.upload(
        `${projectName}/${pdfFile.name}`,
        base64
      );

      setStatusMessage('Processing notes with Claude...');

      // 2. Execute processing
      const executeResult = await api.executeNotes({
        file_path: uploadResult.path,
        project_name: projectName,
        project_type: 'development',
      });

      setStatusMessage('Waiting for project generation...');

      // 3. Poll for completion
      const task = await api.pollForCompletion(executeResult.task_id, 180, 2000); // 6 min timeout

      if (task.status === 'COMPLETED' && task.result) {
        // Get project_id from result
        const result = task.result as { project_id?: string };
        if (result.project_id) {
          onProjectCreated(result.project_id);
          handleClose();
        } else {
          throw new Error('No project_id in response');
        }
      } else if (task.status === 'FAILED') {
        throw new Error(task.error || 'Processing failed');
      } else {
        throw new Error('Unexpected task status');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create project');
      setStatusMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSubmit = async () => {
    if (uploadFiles.length === 0 || !projectName.trim()) return;

    setIsLoading(true);
    setError(null);
    setStatusMessage('Creating project...');

    try {
      // 1. Create project with source_type: 'uploaded'
      const project = await api.createProject({
        name: projectName,
        source_type: 'uploaded',
      });

      setStatusMessage(`Uploading ${uploadFiles.length} files...`);

      // 2. Read and upload files
      const filesData = await Promise.all(
        uploadFiles.map(async (file) => {
          const content = await file.text();
          // Use webkitRelativePath for folder structure, fallback to name
          const path = file.webkitRelativePath || file.name;
          return {
            path,
            content,
          };
        })
      );

      await api.uploadProjectFiles(project.project_id, filesData);

      onProjectCreated(project.project_id);
      handleClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create project');
      setStatusMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadFiles(files);

    // Auto-set project name from folder if not already set
    if (files.length > 0 && !projectName) {
      const firstPath = files[0].webkitRelativePath;
      if (firstPath) {
        const folderName = firstPath.split('/')[0];
        setProjectName(folderName);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'notes' | 'upload')}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <Pencil className="w-4 h-4" />
              New from Notes
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <FolderUp className="w-4 h-4" />
              Upload Project
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Upload a PDF of your handwritten notes and Claude will create a
              project from them.
            </p>

            <Input
              placeholder="Project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={isLoading}
            />

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                className="hidden"
                id="pdf-upload"
                disabled={isLoading}
              />
              <label htmlFor="pdf-upload" className="cursor-pointer">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {pdfFile ? pdfFile.name : 'Click to upload PDF'}
                </p>
              </label>
            </div>

            <Button
              className="w-full"
              onClick={handleNotesSubmit}
              disabled={!pdfFile || !projectName.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {statusMessage || 'Processing...'}
                </>
              ) : (
                'Create from Notes'
              )}
            </Button>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Upload an existing code project to view and chat about it.
            </p>

            <Input
              placeholder="Project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={isLoading}
            />

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                multiple
                // @ts-expect-error webkitdirectory is not in React types
                webkitdirectory=""
                onChange={handleFolderSelect}
                className="hidden"
                id="folder-upload"
                disabled={isLoading}
              />
              <label htmlFor="folder-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {uploadFiles.length > 0
                    ? `${uploadFiles.length} files selected`
                    : 'Click to upload folder'}
                </p>
              </label>
            </div>

            <Button
              className="w-full"
              onClick={handleUploadSubmit}
              disabled={
                uploadFiles.length === 0 || !projectName.trim() || isLoading
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {statusMessage || 'Uploading...'}
                </>
              ) : (
                'Upload Project'
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
