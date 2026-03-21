import { useEffect, useMemo, useState } from 'react';
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
import { EditorIcon } from './editor/components/EditorIcon';
import { EditorInspector } from './editor/components/EditorInspector';
import { BlockDragPreview } from './editor/components/canvas/BlockDragPreview';
import { BLOCK_DEFINITIONS, getBlockDefinition, getInsertableBlocks } from './editor/blockRegistry';
import { parseEditorDocument, serializeEditorDocument } from './editor/documentPayload';
import { exportDocumentToHtml } from './editor/exportHtml';
import {
  createHostSession,
  getInitMessagePayload,
  hasHostOpener,
  postEditorReady,
  postEditorSave,
} from './editor/hostBridge';
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
const CANVAS_MODES = ['desktop', 'mobile'];
const DOCUMENT_STORAGE_KEY = 'hipsend-email-editor-document';

function loadInitialDocument() {
  if (typeof window === 'undefined') {
    return createInitialDocument();
  }

  try {
    const storedValue = window.localStorage.getItem(DOCUMENT_STORAGE_KEY);
    if (!storedValue) {
      return createInitialDocument();
    }

    return parseEditorDocument(JSON.parse(storedValue));
  } catch {
    return createInitialDocument();
  }
}

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
  const [documentState, setDocumentState] = useState(loadInitialDocument);
  const [selectedBlockId, setSelectedBlockId] = useState('');
  const [activeDrag, setActiveDrag] = useState(null);
  const [dropIndicator, setDropIndicator] = useState(null);
  const [canvasMode, setCanvasMode] = useState('desktop');
  const [copiedPane, setCopiedPane] = useState('');
  const [hostSession, setHostSession] = useState(createHostSession);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const selected = selectedBlockId ? findBlock(documentState, selectedBlockId) : null;
  const selectedBlock = selected?.block || null;
  const parentLocated = selected?.containerId && selected.containerId !== ROOT_CONTAINER_ID
    ? findBlock(documentState, selected.containerId)
    : null;
  const selectedParent = parentLocated?.block?.type === 'column' && parentLocated?.containerId && parentLocated.containerId !== ROOT_CONTAINER_ID
    ? findBlock(documentState, parentLocated.containerId)?.block || null
    : parentLocated?.block || null;
  const selectedParentId = selectedParent?.id || '';
  const selectedParentLabel = selectedParent ? BLOCK_DEFINITIONS[selectedParent.type]?.label || selectedParent.type : '';
  const documentPayload = useMemo(() => serializeEditorDocument(documentState), [documentState]);
  const debugJson = useMemo(() => JSON.stringify(documentPayload, null, 2), [documentPayload]);
  const debugHtml = useMemo(() => exportDocumentToHtml(documentState), [documentState]);

  function commit(updater) {
    setDocumentState((previous) => updater(cloneDocument(previous)));
  }

  function handleReset() {
    setDocumentState(createInitialDocument());
    setSelectedBlockId('');
  }

  function handleSaveToHost() {
    const didPost = postEditorSave({
      document: documentPayload,
      html: exportDocumentToHtml(documentState),
      mode: canvasMode,
      session: hostSession,
    });

    if (!didPost) {
      return;
    }

    window.close();
  }

  function handleCopyDebug(pane, value) {
    if (!navigator.clipboard) {
      return;
    }

    navigator.clipboard.writeText(value);
    setCopiedPane(pane);
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
    const dragData = event.active.data.current;
    if (!dragData) {
      return;
    }

    if (dragData.kind === 'library') {
      const block = createBlock(dragData.blockType);
      setDropIndicator(null);
      setActiveDrag({
        kind: 'library',
        block,
      });
      return;
    }

    if (dragData.kind === 'block') {
      const located = findBlock(documentState, event.active.id);
      if (!located) {
        return;
      }

      setDropIndicator(null);
      setActiveDrag({
        kind: 'block',
        block: located.block,
      });
    }
  }

  function resolveDropIntent(event) {
    const dragData = event.active?.data.current;
    const overData = event.over?.data.current;
    if (!dragData || !overData) {
      return null;
    }

    const movingType = dragData.kind === 'library'
      ? dragData.blockType
      : findBlock(documentState, dragData.blockId)?.block.type;

    if (!movingType) {
      return null;
    }

    const canDropIntoContainer = (containerId) => {
      if (containerId === ROOT_CONTAINER_ID) {
        return true;
      }

      const container = findBlock(documentState, containerId)?.block;
      return Boolean(container && canAcceptChild(container.type, movingType));
    };

    if (overData.kind === 'block-target') {
      if (!canDropIntoContainer(overData.containerId)) {
        return null;
      }

      const activeRect = event.active.rect.current.translated || event.active.rect.current.initial;
      const overRect = event.over?.rect;
      if (!activeRect || !overRect) {
        return null;
      }

      const activeMidY = activeRect.top + (activeRect.height / 2);
      const overMidY = overRect.top + (overRect.height / 2);
      const placement = activeMidY < overMidY ? 'before' : 'after';
      const index = placement === 'before' ? overData.index : overData.index + 1;

      return {
        containerId: overData.containerId,
        index,
        source: 'block-target',
      };
    }

    if (overData.kind === 'container' && canDropIntoContainer(overData.containerId)) {
      return {
        containerId: overData.containerId,
        index: overData.index,
        source: overData.source || 'container',
      };
    }

    return null;
  }

  function handleDragOver(event) {
    const intent = resolveDropIntent(event);
    if (!intent || intent.source === 'drop-zone') {
      setDropIndicator(null);
      return;
    }

    setDropIndicator({
      containerId: intent.containerId,
      index: intent.index,
    });
  }

  function handleDragEnd(event) {
    const dragData = event.active.data.current;
    const dropData = resolveDropIntent(event) || getDropTargetFromOver(event.over);
    setActiveDrag(null);
    setDropIndicator(null);

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
    setDropIndicator(null);
  }

  useEffect(() => {
    function handleKeyDown(event) {
      const isDeleteKey = event.key === 'Delete' || event.key === 'Backspace';
      if (!selectedBlockId || !isDeleteKey) {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement
        && (
          target.isContentEditable
          || target.tagName === 'INPUT'
          || target.tagName === 'TEXTAREA'
          || target.tagName === 'SELECT'
        )
      ) {
        return;
      }

      event.preventDefault();
      handleDeleteSelected();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockId]);

  useEffect(() => {
    window.localStorage.setItem(DOCUMENT_STORAGE_KEY, JSON.stringify(documentPayload));
  }, [documentPayload]);

  useEffect(() => {
    if (!hasHostOpener()) {
      return undefined;
    }

    postEditorReady();

    function handleMessage(event) {
      const payload = getInitMessagePayload(event);
      if (!payload) {
        return;
      }

      const nextDocument = parseEditorDocument(payload.document);

      setDocumentState(nextDocument);
      setSelectedBlockId('');

      if (payload.mode === 'desktop' || payload.mode === 'mobile') {
        setCanvasMode(payload.mode);
      }

      setHostSession({
        origin: event.origin,
        context: payload.context ?? null,
        requestId: typeof payload.requestId === 'string' ? payload.requestId : '',
        source: typeof payload.source === 'string' ? payload.source : '',
      });
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (!copiedPane) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCopiedPane('');
    }, 1600);

    return () => window.clearTimeout(timeoutId);
  }, [copiedPane]);

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
                <EditorIcon name={mode} className="panel__button-icon" />
                <span>{mode[0].toUpperCase() + mode.slice(1)}</span>
              </button>
            ))}
          </div>
          {hostSession.origin ? (
            <button type="button" className="editor-shell__button editor-shell__button--active" onClick={handleSaveToHost}>
              <EditorIcon name="check" className="panel__button-icon" />
              <span>Save</span>
            </button>
          ) : null}
          <button type="button" className="editor-shell__button" onClick={handleReset}>
            <EditorIcon name="reset" className="panel__button-icon" />
            <span>Reset</span>
          </button>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <main className="editor-shell__workspace">
          <EditorBlockLibrary
            blocks={INSERTABLE_BLOCKS}
            onInsertBlock={handleInsertBlock}
          />

          <EditorCanvas
            blocks={documentState}
            selectedBlockId={selectedBlockId}
            selectedParentId={selectedParentId}
            selectedParentLabel={selectedParentLabel}
            onSelectBlock={handleSelectBlock}
            onPatchBlock={handlePatchBlock}
            mode={canvasMode}
            showDropZones={Boolean(activeDrag)}
            dropIndicator={dropIndicator}
          />

          <EditorInspector
            block={selectedBlock}
            definition={selectedBlock ? BLOCK_DEFINITIONS[selectedBlock.type] : null}
            onChange={handleUpdateSelectedBlock}
            onDelete={handleDeleteSelected}
          />
        </main>

        <section className="editor-shell__debug">
          <div className="panel editor-shell__debug-panel">
            <div className="editor-shell__debug-header">
              <span>JSON</span>
              <button type="button" className="editor-shell__debug-copy" onClick={() => handleCopyDebug('json', debugJson)}>
                <EditorIcon name={copiedPane === 'json' ? 'check' : 'copy'} className="panel__button-icon" size={16} />
              </button>
            </div>
            <pre className="editor-shell__debug-code">{debugJson}</pre>
          </div>

          <div className="panel editor-shell__debug-panel">
            <div className="editor-shell__debug-header">
              <span>HTML</span>
              <button type="button" className="editor-shell__debug-copy" onClick={() => handleCopyDebug('html', debugHtml)}>
                <EditorIcon name={copiedPane === 'html' ? 'check' : 'copy'} className="panel__button-icon" size={16} />
              </button>
            </div>
            <pre className="editor-shell__debug-code">{debugHtml}</pre>
          </div>
        </section>

        <DragOverlay>
          {activeDrag?.kind === 'library' ? (
            <div className="editor-shell__drag-chip">
              <span>{getBlockDefinition(activeDrag.block.type)?.label || activeDrag.block.type}</span>
            </div>
          ) : null}
          {activeDrag?.kind === 'block' ? (
            <BlockDragPreview
              block={activeDrag.block}
              preview="desktop"
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </section>
  );
}
