import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getPropClassNames } from '../blockPropClasses';
import { getBlockDefinition, getBlockStyleTokens } from '../blockRegistry';
import { ROOT_CONTAINER_ID } from '../blockUtils';
import { EditableText } from './EditableText';

const EMPTY_CONTAINER_TYPES = new Set(['group']);
const LEAF_BLOCK_TYPES = new Set(['heading', 'text', 'image', 'button', 'spacer', 'divider']);

function BlockDropZone({ containerId, index, label, active = false, disabled = false, hasContent = false }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop:${containerId}`,
    disabled,
    data: {
      kind: 'container',
      containerId,
      index,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`panel__drop-zone${hasContent ? ' panel__drop-zone--with-content' : ''}${isOver || active ? ' panel__drop-zone--over' : ''}`}
    >
      <span>{label}</span>
    </div>
  );
}

function BlockInner({ block, isDesignMode, preview, onPatchBlock, onSelectBlock, selectedBlockId }) {
  const tokens = getBlockStyleTokens(block.props);
  const commonStyle = {
    marginTop: tokens.marginTop,
    marginBottom: tokens.marginBottom,
  };

  if (block.type === 'heading') {
    return (
      <EditableText
        value={block.props.content}
        className={`block-canvas__editable block-canvas__editable--heading ${getPropClassNames(block.props, ['align', 'fontSize', 'fontWeight'])}`.trim()}
        style={{
          ...commonStyle,
          color: block.props.color,
        }}
        onFocus={isDesignMode ? () => onSelectBlock(block.id) : undefined}
        onChange={isDesignMode ? (content) => onPatchBlock(block.id, { content }) : undefined}
      />
    );
  }

  if (block.type === 'text') {
    return (
      <EditableText
        value={block.props.content}
        className={`block-canvas__editable ${getPropClassNames(block.props, ['align', 'fontSize', 'lineHeight'])}`.trim()}
        style={{
          ...commonStyle,
          color: block.props.color,
        }}
        onFocus={isDesignMode ? () => onSelectBlock(block.id) : undefined}
        onChange={isDesignMode ? (content) => onPatchBlock(block.id, { content }) : undefined}
      />
    );
  }

  if (block.type === 'image') {
    return (
      <div className={`block-canvas__media ${getPropClassNames(block.props, ['align'])}`.trim()} style={commonStyle}>
        <img
          src={block.props.src}
          alt={block.props.alt}
          style={{ width: tokens.width, maxWidth: '100%', borderRadius: tokens.radius }}
        />
      </div>
    );
  }

  if (block.type === 'button') {
    const isFullWidth = block.props.width === 'full';

    return (
      <div
        className={`block-canvas__button ${getPropClassNames(block.props, ['align'])}`.trim()}
        style={{
          ...commonStyle,
          display: 'flex',
          width: '100%',
        }}
      >
        <div
          className="block-canvas__button-box"
          style={{
            display: 'inline-flex',
            justifyContent: 'center',
            width: isFullWidth ? '100%' : 'fit-content',
            maxWidth: '100%',
            background: block.props.background,
            color: block.props.textColor,
            padding: `${tokens.paddingY} ${tokens.paddingX}`,
            borderRadius: tokens.radius,
          }}
        >
          <EditableText
            value={block.props.label}
            className="block-canvas__editable block-canvas__editable--button"
            style={{
              color: block.props.textColor,
              width: isFullWidth ? '100%' : 'auto',
              textAlign: 'center',
            }}
            onFocus={isDesignMode ? () => onSelectBlock(block.id) : undefined}
            onChange={isDesignMode ? (label) => onPatchBlock(block.id, { label }) : undefined}
          />
        </div>
      </div>
    );
  }

  if (block.type === 'spacer') {
    return <div className="block-canvas__spacer" style={{ height: tokens.height, marginTop: 0, marginBottom: 0 }} />;
  }

  if (block.type === 'divider') {
    return (
      <div style={commonStyle}>
        <div
          className="block-canvas__divider"
          style={{
            height: tokens.borderWidth,
            background: block.props.color,
          }}
        />
      </div>
    );
  }

  if (block.type === 'group') {
    return (
      <ChildDropContainer
        block={block}
        blocks={block.children || []}
        selectedBlockId={selectedBlockId}
        onSelectBlock={onSelectBlock}
        onPatchBlock={onPatchBlock}
        preview={preview}
        isDesignMode={isDesignMode}
        label="Drop block here"
      />
    );
  }

  if (block.type === 'columns' || block.type === 'columns3') {
    return (
      <div
        className={`block-canvas__columns ${getPropClassNames(block.props, ['verticalAlign'])}${preview === 'mobile' && block.props.stackOnMobile === 'yes' ? ' block-canvas__columns--stacked' : ''}`.trim()}
        style={{
          gap: tokens.gap,
          gridTemplateColumns: block.type === 'columns3' ? 'repeat(3, minmax(0, 1fr))' : undefined,
        }}
      >
        {(block.children || []).map((column) => (
          <ColumnDropArea
            key={column.id}
            column={column}
            selectedBlockId={selectedBlockId}
            onSelectBlock={onSelectBlock}
            onPatchBlock={onPatchBlock}
            preview={preview}
            isDesignMode={isDesignMode}
          />
        ))}
      </div>
    );
  }

  if (!LEAF_BLOCK_TYPES.has(block.type) && getBlockDefinition(block.type)?.supportsChildren) {
    return (
      <ChildDropContainer
        block={block}
        blocks={block.children || []}
        selectedBlockId={selectedBlockId}
        onSelectBlock={onSelectBlock}
        onPatchBlock={onPatchBlock}
        preview={preview}
        isDesignMode={isDesignMode}
        label="Drop block here"
      />
    );
  }

  return null;
}

function ChildDropContainer({ block, blocks, selectedBlockId, onSelectBlock, onPatchBlock, preview, isDesignMode, label }) {
  const showEmptyState = isDesignMode && !blocks.length && EMPTY_CONTAINER_TYPES.has(block.type);

  return (
    <div className={`panel__child-container${showEmptyState ? ' panel__child-container--empty' : ''}`}>
      {blocks.length ? (
        <BlockList
          blocks={blocks}
          containerId={block.id}
          selectedBlockId={selectedBlockId}
          onSelectBlock={onSelectBlock}
          onPatchBlock={onPatchBlock}
          preview={preview}
          isDesignMode={isDesignMode}
        />
      ) : null}
      {isDesignMode ? (
        <BlockDropZone
          containerId={block.id}
          index={block.children?.length || 0}
          label={label}
          disabled={!isDesignMode}
          hasContent={blocks.length > 0}
        />
      ) : null}
    </div>
  );
}

function ColumnDropArea({ column, selectedBlockId, onSelectBlock, onPatchBlock, preview, isDesignMode }) {
  return (
    <div className="block-canvas__column">
      <ChildDropContainer
        block={column}
        blocks={column.children || []}
        selectedBlockId={selectedBlockId}
        onSelectBlock={onSelectBlock}
        onPatchBlock={onPatchBlock}
        preview={preview}
        isDesignMode={isDesignMode}
        label="Drop block here"
      />
    </div>
  );
}

function BlockContainer({
  block,
  definition,
  isSelected,
  isDragging,
  isDesignMode,
  attributes,
  listeners,
  setNodeRef,
  style,
  onSelectBlock,
  children,
}) {
  const tokens = getBlockStyleTokens(block.props);

  return (
    <article
      ref={setNodeRef}
      className={`block-canvas__container block-canvas__container--${block.type}${isDesignMode ? '' : ' block-canvas__container--preview'}${isSelected && isDesignMode ? ' block-canvas__container--selected block-canvas__container--draggable' : ''}${isDragging ? ' block-canvas__container--dragging' : ''}`}
      style={style}
      {...(isDesignMode && isSelected ? attributes : {})}
      {...(isDesignMode && isSelected ? listeners : {})}
      onClick={isDesignMode ? (event) => {
        event.stopPropagation();
        onSelectBlock(block.id);
      } : undefined}
    >
      {isDesignMode ? (
        <header className="block-canvas__container-header">
          <span className="block-canvas__container-category">{definition.category}</span>
          <span className="block-canvas__container-label">{definition.label}</span>
        </header>
      ) : null}
      <div
        className={`block-canvas__container-body block-canvas__container-body--${block.type}`}
        style={{
          background: block.props.background || undefined,
          padding: isDesignMode ? '18px' : undefined,
          gap: block.type === 'group' ? tokens.gap : undefined,
          borderRadius: block.type === 'group' ? tokens.radius : undefined,
        }}
      >
        {children}
      </div>
    </article>
  );
}

function SortableBlock({ block, containerId, index, selectedBlockId, onSelectBlock, onPatchBlock, preview, isDesignMode }) {
  const definition = getBlockDefinition(block.type);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    disabled: !isDesignMode,
    data: {
      kind: 'block',
      blockId: block.id,
      containerId,
      index,
      type: block.type,
    },
  });

  return (
    <BlockContainer
      block={block}
      definition={definition}
      isSelected={selectedBlockId === block.id}
      isDragging={isDragging}
      isDesignMode={isDesignMode}
      attributes={attributes}
      listeners={listeners}
      setNodeRef={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      onSelectBlock={onSelectBlock}
    >
      <BlockInner
        block={block}
        isDesignMode={isDesignMode}
        preview={preview}
        onPatchBlock={onPatchBlock}
        onSelectBlock={onSelectBlock}
        selectedBlockId={selectedBlockId}
      />
    </BlockContainer>
  );
}

function BlockList({ blocks, containerId, selectedBlockId, onSelectBlock, onPatchBlock, preview, isDesignMode, unwrapped = false }) {
  const items = blocks.map((block, index) => (
    <SortableBlock
      key={block.id}
      block={block}
      containerId={containerId}
      index={index}
      selectedBlockId={selectedBlockId}
      onSelectBlock={onSelectBlock}
      onPatchBlock={onPatchBlock}
      preview={preview}
      isDesignMode={isDesignMode}
    />
  ));

  return (
    <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
      {unwrapped ? items : <div>{items}</div>}
    </SortableContext>
  );
}

export function EditorCanvas({ blocks, selectedBlockId, onSelectBlock, onPatchBlock, mode }) {
  const isDesignMode = mode === 'design';
  const preview = mode === 'mobile' ? 'mobile' : 'desktop';
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-root',
    disabled: !isDesignMode,
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
          unwrapped
        />
      ) : (
        <div className="panel__empty-state">
          <p>Start from an empty canvas. Add a block from the left or drop one here.</p>
        </div>
      )}
    </section>
  );
}
