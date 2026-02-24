import { useAuth, useUser } from '@clerk/clerk-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Folder, Plus, Search, LogOut, Loader2, Pencil, Upload, PlayCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { api, Project, SourceType } from '@/lib/api';
import { NewProjectModal } from '@/components/NewProjectModal';
import { JobsTable } from '@/components/JobsTable';

const Dashboard = () => {
  const { isLoaded, isSignedIn, signOut, getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

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

  // Handle project click - navigate to project viewer
  const handleProjectClick = (project: Project) => {
    navigate(`/project/${project.project_id}`);
  };

  // Handle new project creation
  const handleProjectCreated = (projectId: string) => {
    // Invalidate projects query to refresh the list
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    // Navigate to the new project
    navigate(`/project/${projectId}`);
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
          <Tabs defaultValue="projects">
            {/* Title row with tabs and actions */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <TabsList>
                  <TabsTrigger value="projects" className="flex items-center gap-2">
                    <Folder className="w-4 h-4" />
                    Projects
                  </TabsTrigger>
                  <TabsTrigger value="jobs" className="flex items-center gap-2">
                    <PlayCircle className="w-4 h-4" />
                    Jobs
                  </TabsTrigger>
                </TabsList>
              </div>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setShowNewProjectModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>

            {/* Projects tab */}
            <TabsContent value="projects">
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
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setShowNewProjectModal(true)}
                  >
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
            </TabsContent>

            {/* Jobs tab */}
            <TabsContent value="jobs">
              <JobsTable />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* New Project Modal */}
        <NewProjectModal
          isOpen={showNewProjectModal}
          onClose={() => setShowNewProjectModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      </main>
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

  // Source type styling
  const sourceType = project.source_type || 'written';
  const sourceTypeConfig: Record<SourceType, { color: string; bgColor: string; label: string; Icon: typeof Pencil }> = {
    written: {
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      label: 'From Notes',
      Icon: Pencil,
    },
    uploaded: {
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      label: 'Uploaded',
      Icon: Upload,
    },
  };

  const { color, bgColor, label, Icon } = sourceTypeConfig[sourceType];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center relative">
            <Folder className="w-5 h-5 text-primary" />
            {/* Source type indicator dot */}
            <span
              className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${sourceType === 'written' ? 'bg-purple-500' : 'bg-blue-500'}`}
              title={label}
            />
          </div>
          <div>
            <h3 className="font-semibold">{project.name}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {/* Source type badge */}
              <span className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-1 ${bgColor} ${color}`}>
                <Icon className="w-3 h-3" />
                {label}
              </span>
              {/* Language badge */}
              {project.language && (
                <span className="flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${languageColors[project.language] || 'bg-gray-500'}`}
                  />
                  <span className="text-xs text-muted-foreground capitalize">
                    {project.language}
                    {project.framework && ` / ${project.framework}`}
                  </span>
                </span>
              )}
            </div>
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
