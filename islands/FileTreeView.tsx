import { VNode } from "preact";
import { useState } from "preact/hooks";

interface FileTreeProps {
  tree: { [key: string]: TreeEntry };
  level?: number;
}

const FileTreeView = ({ tree, level = 0 }: FileTreeProps): VNode => {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  const toggleDir = (name: string) => {
    setExpandedDirs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  };

  return (
    <ul class="list-none pl-4">
      {Object.entries(tree).map(([name, entry]) => (
        <li key={name} class="my-1">
          <span 
            class={`inline-block cursor-pointer ${entry.type === 'directory' ? 'font-bold' : ''}`}
            onClick={() => entry.type === 'directory' && toggleDir(name)}
          >
            {entry.type === 'directory' ? (expandedDirs.has(name) ? '🔽 ' : '▶️ ') : '📄 '}
            {name}
          </span>
          {entry.type === 'directory' && expandedDirs.has(name) && (
            <FileTreeView tree={entry.contents} level={level + 1} />
          )}
        </li>
      ))}
    </ul>
  );
};

export default FileTreeView;