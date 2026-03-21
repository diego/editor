import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useLayoutEffect, useRef, useState } from 'react';
import { getBlockDefinition } from '../blockRegistry';
import { ROOT_CONTAINER_ID } from '../blockUtils';
import { BlockNode } from './canvas/BlockNode';
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

function DesignBlock({
  block,
  containerId,
  index,
  selectedBlockId,
  selectedParentId,
  selectedParentLabel,
  onSelectBlock,
  onPatchBlock,
  preview,
  isDesignMode,
  showDropZones,
  setSlotRef,
  renderBlockList,
}) {
  const definition = getBlockDefinition(block.type);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
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
      style={{ '--block-hit-area-size': '24px' }}
    >
      <div
        ref={setHitAreaRef}
        className={`block-canvas__block-hit-area${showDropZones ? ' block-canvas__block-hit-area--active' : ''}`}
        aria-hidden="true"
      />
      <BlockNode
        block={block}
        isSelected={selectedBlockId === block.id}
        isDragging={isDragging}
        attributes={attributes}
        listeners={listeners}
        setNodeRef={setNodeRef}
        style={isDragging ? { zIndex: 20 } : undefined}
        onSelectBlock={onSelectBlock}
        selectedParentId={selectedBlockId === block.id ? selectedParentId : ''}
        selectedParentLabel={selectedBlockId === block.id ? selectedParentLabel : ''}
        selectedLabel={definition?.label || block.type}
      >
        <BlockRenderer
          block={block}
          isDesignMode
          preview={preview}
          onPatchBlock={onPatchBlock}
          onSelectBlock={onSelectBlock}
          renderBlockList={renderBlockList}
        />
      </BlockNode>
    </div>
  );
}

function BlockList({
  blocks,
  containerId,
  selectedBlockId,
  selectedParentId,
  selectedParentLabel,
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
      selectedParentId={selectedParentId}
      selectedParentLabel={selectedParentLabel}
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
      setMarkerTop(firstRect.top - listRect.top);
      return;
    }

    if (dropIndicator.index >= blocks.length) {
      const lastSlot = slotRefs.current.get(blocks[blocks.length - 1].id);
      if (!lastSlot) {
        setMarkerTop(null);
        return;
      }

      const lastRect = lastSlot.getBoundingClientRect();
      setMarkerTop(lastRect.bottom - listRect.top);
      return;
    }

    const nextSlot = slotRefs.current.get(blocks[dropIndicator.index].id);
    if (!nextSlot) {
      setMarkerTop(null);
      return;
    }

    const nextRect = nextSlot.getBoundingClientRect();
    setMarkerTop(nextRect.top - listRect.top);
  }, [blocks, containerId, dropIndicator, isDesignMode]);

  return (
    <div
      ref={listRef}
      className="block-canvas__list"
      style={{ gap: gap || '0px' }}
    >
      {isDesignMode && markerTop !== null ? (
        <div className="block-canvas__list-marker" style={{ top: `${markerTop}px` }}>
          <BlockInsertionMarker />
        </div>
      ) : null}
      {isDesignMode ? <ListEdgeTarget containerId={containerId} index={0} enabled={showDropZones} position="top" /> : null}
      {blocks.map((block, index) => (
        <DesignBlock
          key={block.id}
          block={block}
          containerId={containerId}
          index={index}
          selectedBlockId={selectedBlockId}
          selectedParentId={selectedParentId}
          selectedParentLabel={selectedParentLabel}
          onSelectBlock={onSelectBlock}
          onPatchBlock={onPatchBlock}
          preview={preview}
          isDesignMode={isDesignMode}
          showDropZones={showDropZones}
          setSlotRef={setSlotRef}
          renderBlockList={renderNestedBlockList}
        />
      ))}
      {isDesignMode ? <ListEdgeTarget containerId={containerId} index={blocks.length} enabled={showDropZones} position="bottom" /> : null}
    </div>
  );
}

export function EditorCanvas({ blocks, selectedBlockId, selectedParentId = '', selectedParentLabel = '', onSelectBlock, onPatchBlock, mode, showDropZones = false, dropIndicator = null }) {
  const isDesignMode = true;
  const preview = mode === 'mobile' ? 'mobile' : 'desktop';
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-root',
    disabled: blocks.length > 0,
    data: {
      kind: 'container',
      containerId: ROOT_CONTAINER_ID,
      index: blocks.length,
      source: 'drop-zone',
    },
  });

  return (
    <section
      ref={setNodeRef}
      className={`panel panel--canvas block-canvas__root${isOver ? ' block-canvas__root--over' : ''}${preview === 'mobile' ? ' block-canvas__root--mobile' : ' block-canvas__root--desktop'}`}
      data-testid="editor-canvas"
      onClick={() => onSelectBlock('')}
    >
      {blocks.length ? (
        <BlockList
          blocks={blocks}
          containerId={ROOT_CONTAINER_ID}
          selectedBlockId={selectedBlockId}
          selectedParentId={selectedParentId}
          selectedParentLabel={selectedParentLabel}
          onSelectBlock={onSelectBlock}
          onPatchBlock={onPatchBlock}
          preview={preview}
          isDesignMode={isDesignMode}
          showDropZones={showDropZones}
          dropIndicator={dropIndicator}
        />
      ) : (
        <div className="panel__empty-state">
          <p>Start from an empty canvas. Add a block from the left or drop one here.</p>
        </div>
      )}
    </section>
  );
}
