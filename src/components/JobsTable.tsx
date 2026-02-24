import { useQuery } from '@tanstack/react-query';
import { Loader2, PlayCircle, FileText, FolderPlus, FolderEdit, MessageSquare } from 'lucide-react';
import { api, TaskResult } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const taskTypeLabels: Record<string, { label: string; Icon: typeof PlayCircle }> = {
  execute_note: { label: 'Execute', Icon: PlayCircle },
  summarize: { label: 'Summarize', Icon: FileText },
  create_project: { label: 'Create Project', Icon: FolderPlus },
  existing_project: { label: 'Update Project', Icon: FolderEdit },
  chat: { label: 'Chat', Icon: MessageSquare },
};

function StatusBadge({ status }: { status: TaskResult['status'] }) {
  switch (status) {
    case 'NEW':
      return <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/30">Queued</Badge>;
    case 'IN_PROGRESS':
    case 'YIELDED':
      return (
        <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Processing
        </Badge>
      );
    case 'COMPLETED':
      return <Badge className="bg-green-500/15 text-green-400 border-green-500/30">Completed</Badge>;
    case 'FAILED':
      return <Badge className="bg-red-500/15 text-red-400 border-red-500/30">Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function JobsTable() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.listTasks(),
    refetchInterval: (query) => {
      const tasks = query.state.data?.tasks ?? [];
      const hasActive = tasks.some(t => t.status === 'NEW' || t.status === 'IN_PROGRESS' || t.status === 'YIELDED');
      return hasActive ? 10000 : false;
    },
  });

  const tasks = data?.tasks ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Unable to load jobs. Please try again later.</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-20">
        <PlayCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
        <h2 className="text-xl font-semibold mb-2">No jobs yet</h2>
        <p className="text-muted-foreground">
          Execute a note from the iPad app to see results here.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Completed</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => {
          const typeInfo = taskTypeLabels[task.task_type] ?? { label: task.task_type, Icon: PlayCircle };
          const TypeIcon = typeInfo.Icon;

          return (
            <TableRow key={task.task_id}>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <StatusBadge status={task.status} />
                  {task.status === 'FAILED' && (
                    <span className="text-xs text-red-400/80 italic">
                      A developer has been alerted and will be in contact with you soon.
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <TypeIcon className="w-4 h-4" />
                  {typeInfo.label}
                </span>
              </TableCell>
              <TableCell>
                {task.project_name ? (
                  <span className="text-sm">{task.project_name}</span>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(task.created_at)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {task.completed_at ? formatDate(task.completed_at) : '—'}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
