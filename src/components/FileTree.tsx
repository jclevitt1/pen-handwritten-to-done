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

interface FileTreeProps {
  files: ProjectFile[];
  selectedFile: ProjectFile | null;
  onSelectFile: (file: ProjectFile) => void;
  // File operations
  onDeleteFile?: (file: ProjectFile) => void;
  onRenameFile?: (file: ProjectFile) => void;
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

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const path = parts.slice(0, i + 1).join('/');

      let node = current.find(n => n.name === part);

      if (!node) {
        node = {
          name: part,
          path,
          isFolder: !isLast,
          children: [],
          file: isLast ? file : undefined,
        };
        current.push(node);
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
      <div>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center gap-1 px-2 py-1 hover:bg-muted rounded text-sm text-left"
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
              {expanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              <Folder className="w-4 h-4 text-blue-500 shrink-0" />
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
        {expanded && (
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
        )}
      </div>
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          onClick={() => node.file && onSelectFile(node.file)}
          className={`w-full flex items-center gap-1 px-2 py-1 rounded text-sm text-left ${
            isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
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

export function FileTree({
  files,
  selectedFile,
  onSelectFile,
  onDeleteFile,
  onRenameFile,
  onCreateFile,
  onCreateFolder,
  onDeleteFolder,
}: FileTreeProps) {
  const tree = buildTree(files);

  if (files.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No files in project
      </div>
    );
  }

  return (
    <div className="py-2">
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
    </div>
  );
}
