import { useDraggable, useDroppable } from '@dnd-kit/core';
import { getBlockDefinition } from '../blockRegistry';
import { ROOT_CONTAINER_ID } from '../blockUtils';
import { BlockDropZone } from './canvas/BlockDropZone';
import { BlockContainer } from './canvas/BlockContainer';
import { BlockRenderer } from './canvas/BlockRenderer';

function CanvasBlock({ block, containerId, index, selectedBlockId, onSelectBlock, onPatchBlock, preview, isDesignMode, showDropZones }) {
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

  if (!isDesignMode) {
    return (
      <BlockRenderer
        block={block}
        isDesignMode={false}
        preview={preview}
        onPatchBlock={onPatchBlock}
        onSelectBlock={onSelectBlock}
        renderBlockList={(childBlocks, childContainerId, options = {}) => (
          <BlockList
            blocks={childBlocks}
            containerId={childContainerId}
            selectedBlockId={selectedBlockId}
            onSelectBlock={onSelectBlock}
            onPatchBlock={onPatchBlock}
            preview={preview}
            isDesignMode={false}
            showDropZones={false}
            gap={options.gap}
          />
        )}
        showDropZones={false}
      />
    );
  }

  return (
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
        isDesignMode={isDesignMode}
        preview={preview}
        onPatchBlock={onPatchBlock}
        onSelectBlock={onSelectBlock}
        renderBlockList={(childBlocks, childContainerId, options = {}) => (
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
          />
        )}
        showDropZones={showDropZones}
      />
    </BlockContainer>
  );
}

function BlockList({ blocks, containerId, selectedBlockId, onSelectBlock, onPatchBlock, preview, isDesignMode, showDropZones, gap }) {
  const items = blocks.flatMap((block, index) => {
    const blockItems = [];

    if (showDropZones) {
      blockItems.push(
        <BlockDropZone
          key={`drop:${containerId}:${index}`}
          containerId={containerId}
          index={index}
          label="Drop block here"
          disabled={!isDesignMode}
          role="insertion"
          separated
        />,
      );
    }

    blockItems.push(
      <CanvasBlock
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
      />,
    );

    return blockItems;
  });

  if (showDropZones) {
    items.push(
      <BlockDropZone
        key={`drop:${containerId}:${blocks.length}`}
        containerId={containerId}
        index={blocks.length}
        label="Drop block here"
        disabled={!isDesignMode}
        role="insertion"
        separated
      />,
    );
  }

  const listClassName = [
    'block-canvas__list',
    isDesignMode ? 'block-canvas__list--design' : 'block-canvas__list--preview',
  ].filter(Boolean).join(' ');

  return <div className={listClassName} style={gap ? { '--block-list-gap': gap } : undefined}>{items}</div>;
}

export function EditorCanvas({ blocks, selectedBlockId, onSelectBlock, onPatchBlock, mode, showDropZones = false }) {
  const isDesignMode = mode === 'design';
  const preview = mode === 'mobile' ? 'mobile' : 'desktop';
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-root',
    disabled: !isDesignMode || blocks.length > 0,
    data: {
      kind: 'container',
      containerId: ROOT_CONTAINER_ID,
      index: blocks.length,
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
        />
      ) : (
        <div className="panel__empty-state">
          <p>{isDesignMode ? 'Start from an empty canvas. Add a block from the left or drop one here.' : 'No content yet.'}</p>
        </div>
      )}
    </section>
  );
}
