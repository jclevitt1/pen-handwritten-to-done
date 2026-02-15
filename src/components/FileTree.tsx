import { ChevronRight, ChevronDown, FileText, Folder, Pencil, Trash, FilePlus, FolderPlus } from 'lucide-react';
import { useState } from 'react';
import { ProjectFile } from '@/lib/api';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { DndContext, DragEndEvent, useDraggable, useDroppable, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';

interface FileTreeProps {
  files: ProjectFile[];
  selectedFile: ProjectFile | null;
  onSelectFile: (file: ProjectFile) => void;
  // File operations
  onDeleteFile?: (file: ProjectFile) => void;
  onRenameFile?: (file: ProjectFile) => void;
  onMoveFile?: (fromPath: string, toFolderPath: string) => void;
  // Folder operations
  onCreateFile?: (parentPath: string) => void;
  onCreateFolder?: (parentPath: string) => void;
  onDeleteFolder?: (folderPath: string) => void;
}

interface TreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  children: TreeNode[];
  file?: ProjectFile;
}

// Build tree structure from flat file list
function buildTree(files: ProjectFile[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const file of files) {
    const parts = file.name.split('/');
    let current = root;

    // Check if this entry is explicitly a folder (from backend type field)
    const isExplicitFolder = (file as any).type === 'folder';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const path = parts.slice(0, i + 1).join('/');

      let node = current.find(n => n.name === part);

      if (!node) {
        // For explicit folders, the last part is also a folder
        const nodeIsFolder = !isLast || isExplicitFolder;
        node = {
          name: part,
          path,
          isFolder: nodeIsFolder,
          children: [],
          file: (isLast && !isExplicitFolder) ? file : undefined,
        };
        current.push(node);
      } else if (isLast && isExplicitFolder) {
        // If we found an existing node and this is an explicit folder, ensure it's marked as folder
        node.isFolder = true;
      }

      current = node.children;
    }
  }

  // Sort: folders first, then alphabetically
  const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
    return nodes
      .map(n => ({ ...n, children: sortNodes(n.children) }))
      .sort((a, b) => {
        if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  };

  return sortNodes(root);
}

// Draggable file component
function DraggableFile({
  node,
  depth,
  isSelected,
  onSelectFile,
  onDeleteFile,
  onRenameFile,
}: {
  node: TreeNode;
  depth: number;
  isSelected: boolean;
  onSelectFile: (file: ProjectFile) => void;
  onDeleteFile?: (file: ProjectFile) => void;
  onRenameFile?: (file: ProjectFile) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: node.file?.name || node.path,
    data: { type: 'file', file: node.file, path: node.file?.name },
  });

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          ref={setNodeRef}
          {...listeners}
          {...attributes}
          onClick={() => node.file && onSelectFile(node.file)}
          className={`w-full flex items-center gap-1 px-2 py-1 rounded text-sm text-left ${
            isDragging ? 'opacity-50' : ''
          } ${isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="truncate">{node.name}</span>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => node.file && onRenameFile?.(node.file)}>
          <Pencil className="mr-2 h-4 w-4" />
          Rename
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => node.file && onDeleteFile?.(node.file)}
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

// Droppable folder component
function DroppableFolder({
  node,
  depth,
  children,
  onToggle,
  expanded,
  onCreateFile,
  onCreateFolder,
  onDeleteFolder,
}: {
  node: TreeNode;
  depth: number;
  children: React.ReactNode;
  onToggle: () => void;
  expanded: boolean;
  onCreateFile?: (parentPath: string) => void;
  onCreateFolder?: (parentPath: string) => void;
  onDeleteFolder?: (folderPath: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: node.path,
    data: { type: 'folder', path: node.path },
  });

  return (
    <div ref={setNodeRef}>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button
            onClick={onToggle}
            className={`w-full flex items-center gap-1 px-2 py-1 rounded text-sm text-left ${
              isOver ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-muted'
            }`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
            <Folder className={`w-4 h-4 shrink-0 ${isOver ? 'text-primary' : 'text-blue-500'}`} />
            <span className="truncate">{node.name}</span>
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => onCreateFile?.(node.path)}>
            <FilePlus className="mr-2 h-4 w-4" />
            New File
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onCreateFolder?.(node.path)}>
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDeleteFolder?.(node.path)}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Folder
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {expanded && children}
    </div>
  );
}

function TreeNodeComponent({
  node,
  depth,
  selectedFile,
  onSelectFile,
  onDeleteFile,
  onRenameFile,
  onCreateFile,
  onCreateFolder,
  onDeleteFolder,
}: {
  node: TreeNode;
  depth: number;
  selectedFile: ProjectFile | null;
  onSelectFile: (file: ProjectFile) => void;
  onDeleteFile?: (file: ProjectFile) => void;
  onRenameFile?: (file: ProjectFile) => void;
  onCreateFile?: (parentPath: string) => void;
  onCreateFolder?: (parentPath: string) => void;
  onDeleteFolder?: (folderPath: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isSelected = selectedFile?.name === node.file?.name;

  if (node.isFolder) {
    return (
      <DroppableFolder
        node={node}
        depth={depth}
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
        onCreateFile={onCreateFile}
        onCreateFolder={onCreateFolder}
        onDeleteFolder={onDeleteFolder}
      >
        <div>
          {node.children.map(child => (
            <TreeNodeComponent
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
              onDeleteFile={onDeleteFile}
              onRenameFile={onRenameFile}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              onDeleteFolder={onDeleteFolder}
            />
          ))}
        </div>
      </DroppableFolder>
    );
  }

  return (
    <DraggableFile
      node={node}
      depth={depth}
      isSelected={isSelected}
      onSelectFile={onSelectFile}
      onDeleteFile={onDeleteFile}
      onRenameFile={onRenameFile}
    />
  );
}

// Root drop zone for moving files to root level
function RootDropZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: '__root__',
    data: { type: 'folder', path: '' },
  });

  return (
    <div
      ref={setNodeRef}
      className={`py-2 min-h-[50px] ${isOver ? 'bg-primary/10' : ''}`}
    >
      {children}
    </div>
  );
}

export function FileTree({
  files,
  selectedFile,
  onSelectFile,
  onDeleteFile,
  onRenameFile,
  onMoveFile,
  onCreateFile,
  onCreateFolder,
  onDeleteFolder,
}: FileTreeProps) {
  const [activeFile, setActiveFile] = useState<ProjectFile | null>(null);
  const tree = buildTree(files);

  // Configure sensor with distance constraint so clicks work normally
  // Drag only activates after moving 8 pixels
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveFile(null);

    if (!over || !onMoveFile) return;

    const activeData = active.data.current as { type: string; path: string; file: ProjectFile } | undefined;
    const overData = over.data.current as { type: string; path: string } | undefined;

    if (!activeData || activeData.type !== 'file') return;
    if (!overData || overData.type !== 'folder') return;

    const fromPath = activeData.path;
    const toFolderPath = overData.path;

    // Don't move to same parent folder
    const fromFolder = fromPath.includes('/') ? fromPath.substring(0, fromPath.lastIndexOf('/')) : '';
    if (fromFolder === toFolderPath) return;

    onMoveFile(fromPath, toFolderPath);
  };

  const handleDragStart = (event: { active: { data: { current: unknown } } }) => {
    const data = event.active.data.current as { file?: ProjectFile } | undefined;
    if (data?.file) {
      setActiveFile(data.file);
    }
  };

  if (files.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No files in project
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <RootDropZone>
        {tree.map(node => (
          <TreeNodeComponent
            key={node.path}
            node={node}
            depth={0}
            selectedFile={selectedFile}
            onSelectFile={onSelectFile}
            onDeleteFile={onDeleteFile}
            onRenameFile={onRenameFile}
            onCreateFile={onCreateFile}
            onCreateFolder={onCreateFolder}
            onDeleteFolder={onDeleteFolder}
          />
        ))}
      </RootDropZone>
      <DragOverlay>
        {activeFile && (
          <div className="flex items-center gap-1 px-2 py-1 bg-background border rounded shadow-lg text-sm">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span>{activeFile.name.split('/').pop()}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
