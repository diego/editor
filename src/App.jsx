import { useState } from 'react';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { EditorBlockLibrary } from './editor/components/EditorBlockLibrary';
import { EditorCanvas } from './editor/components/EditorCanvas';
import { EditorInspector } from './editor/components/EditorInspector';
import { BLOCK_DEFINITIONS, getBlockDefinition, getInsertableBlocks } from './editor/blockRegistry';
import {
  ROOT_CONTAINER_ID,
  canAcceptChild,
  cloneDocument,
  createBlock,
  createInitialDocument,
  findBlock,
  getChildContainerLength,
  getDropTargetFromOver,
  insertBlock,
  isDescendantBlock,
  moveBlock,
  removeBlock,
  updateBlockProps,
} from './editor/blockUtils';

const INSERTABLE_BLOCKS = getInsertableBlocks();
const CANVAS_MODES = ['design', 'desktop', 'mobile'];

function getInsertionIntent(blocks, selectedBlockId) {
  if (!selectedBlockId) {
    return { containerId: ROOT_CONTAINER_ID, index: blocks.length };
  }

  const selected = findBlock(blocks, selectedBlockId);
  if (!selected) {
    return { containerId: ROOT_CONTAINER_ID, index: blocks.length };
  }

  const definition = getBlockDefinition(selected.block.type);
  if (definition?.supportsChildren) {
    return {
      containerId: selected.block.id,
      index: getChildContainerLength(blocks, selected.block.id),
    };
  }

  return {
    containerId: selected.containerId,
    index: selected.index + 1,
  };
}

function resolveValidInsertion(blocks, blockType, intent) {
  if (intent.containerId === ROOT_CONTAINER_ID) {
    return intent;
  }

  const container = findBlock(blocks, intent.containerId)?.block;
  if (container && canAcceptChild(container.type, blockType)) {
    return intent;
  }

  return {
    containerId: ROOT_CONTAINER_ID,
    index: blocks.length,
  };
}

export default function App() {
  const [documentState, setDocumentState] = useState(createInitialDocument);
  const [selectedBlockId, setSelectedBlockId] = useState('');
  const [activeDrag, setActiveDrag] = useState(null);
  const [canvasMode, setCanvasMode] = useState('design');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const selected = selectedBlockId ? findBlock(documentState, selectedBlockId) : null;
  const selectedBlock = selected?.block || null;
  const isDesignMode = canvasMode === 'design';

  function commit(updater) {
    setDocumentState((previous) => updater(cloneDocument(previous)));
  }

  function handleReset() {
    setDocumentState(createInitialDocument());
    setSelectedBlockId('');
  }

  function handleInsertBlock(type) {
    const nextBlock = createBlock(type);
    const intent = resolveValidInsertion(documentState, type, getInsertionIntent(documentState, selectedBlockId));

    commit((draft) => insertBlock(draft, intent.containerId, intent.index, nextBlock));
    setSelectedBlockId(nextBlock.id);
  }

  function handleSelectBlock(blockId) {
    setSelectedBlockId(blockId);
  }

  function handleUpdateSelectedBlock(name, value) {
    if (!selectedBlockId) {
      return;
    }

    commit((draft) => updateBlockProps(draft, selectedBlockId, { [name]: value }));
  }

  function handlePatchBlock(blockId, patch) {
    commit((draft) => updateBlockProps(draft, blockId, patch));
  }

  function handleDeleteSelected() {
    if (!selectedBlockId) {
      return;
    }

    commit((draft) => removeBlock(draft, selectedBlockId));
    setSelectedBlockId('');
  }

  function handleDragStart(event) {
    if (!isDesignMode) {
      return;
    }

    const dragData = event.active.data.current;
    if (!dragData) {
      return;
    }

    if (dragData.kind === 'library') {
      setActiveDrag({
        kind: 'library',
        type: dragData.blockType,
        label: getBlockDefinition(dragData.blockType)?.label || dragData.blockType,
      });
      return;
    }

    if (dragData.kind === 'block') {
      const located = findBlock(documentState, event.active.id);
      if (!located) {
        return;
      }

      setActiveDrag({
        kind: 'block',
        type: located.block.type,
        label: getBlockDefinition(located.block.type)?.label || located.block.type,
      });
    }
  }

  function handleDragEnd(event) {
    if (!isDesignMode) {
      setActiveDrag(null);
      return;
    }

    const dragData = event.active.data.current;
    const dropData = getDropTargetFromOver(event.over);
    setActiveDrag(null);

    if (!dragData || !dropData) {
      return;
    }

    if (dragData.kind === 'library') {
      if (dropData.containerId !== ROOT_CONTAINER_ID) {
        const container = findBlock(documentState, dropData.containerId)?.block;
        if (!container || !canAcceptChild(container.type, dragData.blockType)) {
          return;
        }
      }

      const nextBlock = createBlock(dragData.blockType);
      commit((draft) => insertBlock(draft, dropData.containerId, dropData.index, nextBlock));
      setSelectedBlockId(nextBlock.id);
      return;
    }

    if (dragData.kind === 'block') {
      if (event.active.id === event.over?.id) {
        return;
      }

      if (dropData.containerId === dragData.blockId || isDescendantBlock(documentState, dragData.blockId, dropData.containerId)) {
        return;
      }

      if (dropData.containerId !== ROOT_CONTAINER_ID) {
        const targetContainer = findBlock(documentState, dropData.containerId)?.block;
        const movingBlock = findBlock(documentState, dragData.blockId)?.block;
        if (!targetContainer || !movingBlock || !canAcceptChild(targetContainer.type, movingBlock.type)) {
          return;
        }
      }

      commit((draft) => moveBlock(draft, dragData.blockId, dropData.containerId, dropData.index));
      setSelectedBlockId(dragData.blockId);
    }
  }

  function handleDragCancel() {
    setActiveDrag(null);
  }

  return (
    <section className="editor-shell">
      <header className="editor-shell__header">
        <h1 className="editor-shell__title">Editor</h1>
        <div className="editor-shell__actions">
          <div className="editor-shell__mode-switch">
            {CANVAS_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                className={canvasMode === mode ? 'editor-shell__button editor-shell__button--active' : 'editor-shell__button'}
                onClick={() => setCanvasMode(mode)}
              >
                {mode[0].toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <button type="button" className="editor-shell__button" onClick={handleReset}>Reset</button>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <main className="editor-shell__workspace">
          <div className={`editor-shell__panel-slot${isDesignMode ? '' : ' editor-shell__panel-slot--hidden'}`}>
            <EditorBlockLibrary
              blocks={INSERTABLE_BLOCKS}
              onInsertBlock={handleInsertBlock}
            />
          </div>

          <EditorCanvas
            blocks={documentState}
            selectedBlockId={selectedBlockId}
            onSelectBlock={handleSelectBlock}
            onPatchBlock={handlePatchBlock}
            mode={canvasMode}
          />

          <div className={`editor-shell__panel-slot${isDesignMode ? '' : ' editor-shell__panel-slot--hidden'}`}>
            <EditorInspector
              block={selectedBlock}
              definition={selectedBlock ? BLOCK_DEFINITIONS[selectedBlock.type] : null}
              onChange={handleUpdateSelectedBlock}
              onDelete={handleDeleteSelected}
            />
          </div>
        </main>

        <DragOverlay>
          {isDesignMode && activeDrag ? (
            <div className="editor-shell__drag-overlay">
              <span>{activeDrag.label}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </section>
  );
}
