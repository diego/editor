import { useDraggable } from '@dnd-kit/core';

function DraggableLibraryItem({ block, onInsert }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library:${block.type}`,
    data: {
      kind: 'library',
      blockType: block.type,
    },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`panel__library-item${isDragging ? ' panel__library-item--dragging' : ''}`}
      onClick={() => onInsert(block.type)}
      {...listeners}
      {...attributes}
    >
      <span className="panel__library-item-label">{block.label}</span>
      <span className="panel__library-item-meta">{block.type}</span>
    </button>
  );
}

export function EditorBlockLibrary({ blocks, onInsertBlock }) {
  const groups = blocks.reduce((accumulator, block) => {
    const existing = accumulator.get(block.category) || [];
    existing.push(block);
    accumulator.set(block.category, existing);
    return accumulator;
  }, new Map());

  return (
    <aside className="panel panel--library">
      <div className="panel__library-groups">
        {Array.from(groups.entries()).map(([category, items]) => (
          <section key={category} className="panel__library-group">
            <h3>{category}</h3>
            <div className="panel__library-group-items">
              {items.map((block) => (
                <DraggableLibraryItem
                  key={block.type}
                  block={block}
                  onInsert={onInsertBlock}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
