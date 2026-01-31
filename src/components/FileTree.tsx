import { ChevronRight, ChevronDown, FileText, Folder } from 'lucide-react';
import { useState } from 'react';
import { ProjectFile } from '@/lib/api';

interface FileTreeProps {
  files: ProjectFile[];
  selectedFile: ProjectFile | null;
  onSelectFile: (file: ProjectFile) => void;
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
}: {
  node: TreeNode;
  depth: number;
  selectedFile: ProjectFile | null;
  onSelectFile: (file: ProjectFile) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isSelected = selectedFile?.name === node.file?.name;

  if (node.isFolder) {
    return (
      <div>
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
        {expanded && (
          <div>
            {node.children.map(child => (
              <TreeNodeComponent
                key={child.path}
                node={child}
                depth={depth + 1}
                selectedFile={selectedFile}
                onSelectFile={onSelectFile}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
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
  );
}

export function FileTree({ files, selectedFile, onSelectFile }: FileTreeProps) {
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
        />
      ))}
    </div>
  );
}
