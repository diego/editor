import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useLayoutEffect, useRef, useState } from 'react';
import { getBlockDefinition } from '../blockRegistry';
import { ROOT_CONTAINER_ID } from '../blockUtils';
import { BlockContainer } from './canvas/BlockContainer';
import { BlockRenderer } from './canvas/BlockRenderer';

function BlockInsertionMarker() {
  return <div className="block-canvas__insertion-marker" aria-hidden="true" />;
}

function ListEdgeTarget({ containerId, index, enabled, position }) {
  const { setNodeRef } = useDroppable({
    id: `edge:${containerId}:${index}:${position}`,
    disabled: !enabled,
    data: {
      kind: 'container',
      containerId,
      index,
      source: position === 'top' ? 'edge-target' : 'trailing-target',
    },
  });

  if (!enabled) {
    return null;
  }

  return <div ref={setNodeRef} className={`block-canvas__list-edge-target block-canvas__list-edge-target--${position}`} aria-hidden="true" />;
}

function PreviewBlock({
  block,
  selectedBlockId,
  onSelectBlock,
  onPatchBlock,
  preview,
  renderBlockList,
}) {
  return (
    <BlockRenderer
      block={block}
      isDesignMode={false}
      preview={preview}
      onPatchBlock={onPatchBlock}
      onSelectBlock={onSelectBlock}
      renderBlockList={renderBlockList}
    />
  );
}

function DesignBlock({
  block,
  containerId,
  index,
  selectedBlockId,
  onSelectBlock,
  onPatchBlock,
  preview,
  isDesignMode,
  showDropZones,
  listGap,
  setSlotRef,
  renderBlockList,
}) {
  const definition = getBlockDefinition(block.type);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: block.id,
    disabled: !isDesignMode || selectedBlockId !== block.id,
    data: {
      kind: 'block',
      blockId: block.id,
      containerId,
      index,
      type: block.type,
    },
  });
  const { setNodeRef: setHitAreaRef } = useDroppable({
    id: `block-target:${block.id}`,
    disabled: !isDesignMode || !showDropZones,
    data: {
      kind: 'block-target',
      blockId: block.id,
      containerId,
      index,
    },
  });

  return (
    <div
      ref={setSlotRef(block.id)}
      className="block-canvas__block-slot"
      style={{ '--block-list-gap': listGap }}
    >
      <div
        ref={setHitAreaRef}
        className={`block-canvas__block-hit-area${showDropZones ? ' block-canvas__block-hit-area--active' : ''}`}
        aria-hidden="true"
      />
      <BlockContainer
        block={block}
        definition={definition}
        isSelected={selectedBlockId === block.id}
        isDragging={isDragging}
        attributes={attributes}
        listeners={listeners}
        setNodeRef={setNodeRef}
        style={transform ? { zIndex: 20 } : undefined}
        onSelectBlock={onSelectBlock}
      >
        <BlockRenderer
          block={block}
          isDesignMode
          preview={preview}
          onPatchBlock={onPatchBlock}
          onSelectBlock={onSelectBlock}
          renderBlockList={renderBlockList}
          showDropZones={showDropZones}
        />
      </BlockContainer>
    </div>
  );
}

function BlockList({
  blocks,
  containerId,
  selectedBlockId,
  onSelectBlock,
  onPatchBlock,
  preview,
  isDesignMode,
  showDropZones,
  gap,
  dropIndicator,
}) {
  const listRef = useRef(null);
  const slotRefs = useRef(new Map());
  const [markerTop, setMarkerTop] = useState(null);
  const listGap = isDesignMode ? '18px' : (gap || '0px');
  const gapPx = Number.parseInt(listGap, 10) || 0;

  function setSlotRef(blockId) {
    return (node) => {
      if (node) {
        slotRefs.current.set(blockId, node);
      } else {
        slotRefs.current.delete(blockId);
      }
    };
  }

  const renderNestedBlockList = (childBlocks, childContainerId, options = {}) => (
    <BlockList
      blocks={childBlocks}
      containerId={childContainerId}
      selectedBlockId={selectedBlockId}
      onSelectBlock={onSelectBlock}
      onPatchBlock={onPatchBlock}
      preview={preview}
      isDesignMode={isDesignMode}
      showDropZones={showDropZones}
      gap={options.gap}
      dropIndicator={dropIndicator}
    />
  );

  useLayoutEffect(() => {
    if (!isDesignMode || !dropIndicator || dropIndicator.containerId !== containerId || !listRef.current) {
      setMarkerTop(null);
      return;
    }

    const listRect = listRef.current.getBoundingClientRect();

    if (!blocks.length) {
      setMarkerTop(0);
      return;
    }

    if (dropIndicator.index <= 0) {
      const firstSlot = slotRefs.current.get(blocks[0].id);
      if (!firstSlot) {
        setMarkerTop(null);
        return;
      }

      const firstRect = firstSlot.getBoundingClientRect();
      setMarkerTop((firstRect.top - listRect.top) - (gapPx / 2));
      return;
    }

    if (dropIndicator.index >= blocks.length) {
      const lastSlot = slotRefs.current.get(blocks[blocks.length - 1].id);
      if (!lastSlot) {
        setMarkerTop(null);
        return;
      }

      const lastRect = lastSlot.getBoundingClientRect();
      setMarkerTop((lastRect.bottom - listRect.top) + (gapPx / 2));
      return;
    }

    const nextSlot = slotRefs.current.get(blocks[dropIndicator.index].id);
    if (!nextSlot) {
      setMarkerTop(null);
      return;
    }

    const nextRect = nextSlot.getBoundingClientRect();
    setMarkerTop((nextRect.top - listRect.top) - (gapPx / 2));
  }, [blocks, containerId, dropIndicator, gapPx, isDesignMode]);

  const listClassName = [
    'block-canvas__list',
    isDesignMode ? 'block-canvas__list--design' : 'block-canvas__list--preview',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={listRef}
      className={listClassName}
      style={{ '--block-list-gap': listGap }}
    >
      {isDesignMode && markerTop !== null ? (
        <div className="block-canvas__list-marker" style={{ top: `${markerTop}px` }}>
          <BlockInsertionMarker />
        </div>
      ) : null}
      {isDesignMode ? <ListEdgeTarget containerId={containerId} index={0} enabled={showDropZones} position="top" /> : null}
      {blocks.map((block, index) => (
        isDesignMode ? (
          <DesignBlock
            key={block.id}
            block={block}
            containerId={containerId}
            index={index}
            selectedBlockId={selectedBlockId}
            onSelectBlock={onSelectBlock}
            onPatchBlock={onPatchBlock}
            preview={preview}
            isDesignMode={isDesignMode}
            showDropZones={showDropZones}
            listGap={listGap}
            setSlotRef={setSlotRef}
            renderBlockList={renderNestedBlockList}
          />
        ) : (
          <PreviewBlock
            key={block.id}
            block={block}
            selectedBlockId={selectedBlockId}
            onSelectBlock={onSelectBlock}
            onPatchBlock={onPatchBlock}
            preview={preview}
            renderBlockList={renderNestedBlockList}
          />
        )
      ))}
      {isDesignMode ? <ListEdgeTarget containerId={containerId} index={blocks.length} enabled={showDropZones} position="bottom" /> : null}
    </div>
  );
}

export function EditorCanvas({ blocks, selectedBlockId, onSelectBlock, onPatchBlock, mode, showDropZones = false, dropIndicator = null }) {
  const isDesignMode = mode === 'design';
  const preview = mode === 'mobile' ? 'mobile' : 'desktop';
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-root',
    disabled: !isDesignMode || blocks.length > 0,
    data: {
      kind: 'container',
      containerId: ROOT_CONTAINER_ID,
      index: blocks.length,
      source: 'drop-zone',
    },
  });

  return (
    <section
      ref={isDesignMode ? setNodeRef : undefined}
      className={`panel panel--canvas block-canvas__root${isDesignMode && isOver ? ' block-canvas__root--over' : ''}${preview === 'mobile' ? ' block-canvas__root--mobile' : ' block-canvas__root--desktop'}${isDesignMode ? '' : ' block-canvas__root--preview'}`}
      data-testid="editor-canvas"
      onClick={isDesignMode ? () => onSelectBlock('') : undefined}
    >
      {blocks.length ? (
        <BlockList
          blocks={blocks}
          containerId={ROOT_CONTAINER_ID}
          selectedBlockId={selectedBlockId}
          onSelectBlock={onSelectBlock}
          onPatchBlock={onPatchBlock}
          preview={preview}
          isDesignMode={isDesignMode}
          showDropZones={showDropZones}
          dropIndicator={dropIndicator}
        />
      ) : (
        <div className="panel__empty-state">
          <p>{isDesignMode ? 'Start from an empty canvas. Add a block from the left or drop one here.' : 'No content yet.'}</p>
        </div>
      )}
    </section>
  );
}
