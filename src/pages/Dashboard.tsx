import { useAuth, useUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Folder, Plus, Search, LogOut, Loader2, Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, Project, ProjectFile } from '@/lib/api';

const Dashboard = () => {
  const { isLoaded, isSignedIn, signOut, getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

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

  // Fetch projects
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', search],
    queryFn: () => api.listProjects(search || undefined),
    enabled: isSignedIn,
    retry: false,
  });

  const projects = data?.projects ?? [];

  // Handle project click - open download dialog
  const handleProjectClick = async (project: Project) => {
    setSelectedProject(project);
    setLoadingFiles(true);
    try {
      const result = await api.listProjectFiles(project.project_id);
      setProjectFiles(result.files || []);
    } catch (e) {
      console.error('Failed to load files:', e);
      setProjectFiles([]);
    }
    setLoadingFiles(false);
  };

  // Handle file download
  const handleDownload = async (file: ProjectFile) => {
    if (!selectedProject) return;
    try {
      const result = await api.getDownloadUrl(selectedProject.project_id, file.name);
      // Create a hidden anchor to trigger actual download
      const link = document.createElement('a');
      link.href = result.download_url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Failed to get download URL:', e);
    }
  };

  // Handle download all files as zip
  const handleDownloadAll = async () => {
    if (!selectedProject) return;
    try {
      const result = await api.getDownloadZipUrl(selectedProject.project_id);
      // Trigger download
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

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              className="stroke-primary"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 3.5L24.5 7L8.2 23.3L3.5 24.5L4.7 19.8L21 3.5Z" />
              <path d="M17.5 7L21 10.5" />
            </svg>
            <span className="font-semibold text-xl">Pen</span>
          </a>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut(() => navigate('/'))}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title and actions */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Your Projects</h1>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-8 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Project grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <Folder className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h2 className="text-xl font-semibold mb-2">Unable to load projects</h2>
              <p className="text-muted-foreground mb-4">
                Something went wrong. Please try again later.
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="mb-4"
              >
                Retry
              </Button>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20">
              <Folder className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first project from the iOS app or upload notes here.
              </p>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.project_id}
                  project={project}
                  onClick={() => handleProjectClick(project)}
                />
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Download Dialog */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedProject(null)}>
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{selectedProject.name}</h2>
              <button onClick={() => setSelectedProject(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingFiles ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : projectFiles.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No files found</p>
            ) : (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                  {projectFiles.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => handleDownload(file)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                    >
                      <Download className="w-4 h-4 text-muted-foreground" />
                      <span className="flex-1 truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}
                      </span>
                    </button>
                  ))}
                </div>
                <Button
                  onClick={handleDownloadAll}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download as Zip
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ProjectCard = ({ project, onClick }: { project: Project; onClick: () => void }) => {
  const languageColors: Record<string, string> = {
    python: 'bg-blue-500',
    java: 'bg-orange-500',
    swift: 'bg-orange-400',
    typescript: 'bg-blue-600',
    javascript: 'bg-yellow-500',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Folder className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{project.name}</h3>
            {project.language && (
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`w-2 h-2 rounded-full ${languageColors[project.language] || 'bg-gray-500'}`}
                />
                <span className="text-xs text-muted-foreground capitalize">
                  {project.language}
                  {project.framework && ` / ${project.framework}`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {project.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {project.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {project.file_count ?? 0} files
        </span>
        <span>
          Updated {new Date(project.updated_at).toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  );
};

export default Dashboard;
