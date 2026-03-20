import { getPropClassNames } from '../../blockPropClasses';
import { getBlockDefinition } from '../../blockRegistry';
import { getBlockStyleTokens } from '../../blockStyles';
import { EditableText } from '../EditableText';
import { BlockDropZone } from './BlockDropZone';

const LEAF_BLOCK_TYPES = new Set(['heading', 'text', 'image', 'button', 'spacer', 'divider']);

function ChildDropContainer({ block, blocks, isDesignMode, label, renderBlockList, gap }) {
  const showInnerDropArea = isDesignMode && !blocks.length;

  return (
    <div className="block-canvas__child-container">
      {blocks.length ? renderBlockList(blocks, block.id, { gap }) : null}
      {showInnerDropArea ? (
        <BlockDropZone
          containerId={block.id}
          index={block.children?.length || 0}
          label={label}
          disabled={!isDesignMode}
          role="inner"
        />
      ) : null}
    </div>
  );
}

function ColumnDropArea({ column, isDesignMode, renderBlockList }) {
  return (
    <div className="block-canvas__column">
      <ChildDropContainer
        block={column}
        blocks={column.children || []}
        isDesignMode={isDesignMode}
        label="Drop block here"
        renderBlockList={renderBlockList}
      />
    </div>
  );
}

export function BlockRenderer({ block, preview, isDesignMode, onPatchBlock, onSelectBlock, renderBlockList }) {
  const tokens = getBlockStyleTokens(block.props);
  const definition = getBlockDefinition(block.type);
  const blockProps = block.props;
  const commonStyle = {
    marginTop: tokens.marginTop,
    marginBottom: tokens.marginBottom,
  };

  if (block.type === 'heading') {
    return (
      <EditableText
        value={blockProps.content}
        className={`block-canvas__editable block-canvas__editable--heading ${getPropClassNames(blockProps, ['textAlign', 'fontSize', 'fontWeight'])}`.trim()}
        style={{ ...commonStyle, color: blockProps.color }}
        onFocus={isDesignMode ? () => onSelectBlock(block.id) : undefined}
        onChange={isDesignMode ? (content) => onPatchBlock(block.id, { content }) : undefined}
      />
    );
  }

  if (block.type === 'text') {
    return (
      <EditableText
        value={blockProps.content}
        className={`block-canvas__editable ${getPropClassNames(blockProps, ['textAlign', 'fontSize', 'lineHeight'])}`.trim()}
        style={{ ...commonStyle, color: blockProps.color }}
        onFocus={isDesignMode ? () => onSelectBlock(block.id) : undefined}
        onChange={isDesignMode ? (content) => onPatchBlock(block.id, { content }) : undefined}
      />
    );
  }

  if (block.type === 'image') {
    return (
      <div className={`block-canvas__media ${getPropClassNames(blockProps, ['textAlign'])}`.trim()} style={commonStyle}>
        <img
          src={blockProps.src}
          alt={blockProps.alt}
          style={{ width: tokens.width, maxWidth: '100%', borderRadius: tokens.borderRadius }}
        />
      </div>
    );
  }

  if (block.type === 'button') {
    const isFullWidth = blockProps.width === 'full';
    const buttonClassName = `block-canvas__button ${getPropClassNames(blockProps, ['justifyContent'])}`.trim();
    const buttonBody = (
      <>
        {isDesignMode ? (
          <EditableText
            value={blockProps.label}
            className="block-canvas__editable block-canvas__editable--button"
            style={{
              color: blockProps.color,
              width: isFullWidth ? '100%' : 'auto',
              textAlign: 'center',
            }}
            onFocus={isDesignMode ? () => onSelectBlock(block.id) : undefined}
            onChange={isDesignMode ? (label) => onPatchBlock(block.id, { label }) : undefined}
          />
        ) : (
          blockProps.label
        )}
      </>
    );

    return (
      <div className={buttonClassName} style={commonStyle}>
        {isDesignMode ? (
          <div
            className="block-canvas__button-box"
            style={{
              width: isFullWidth ? '100%' : undefined,
              backgroundColor: blockProps.backgroundColor,
              color: blockProps.color,
              padding: `${tokens.paddingBlock} ${tokens.paddingInline}`,
              borderRadius: tokens.borderRadius,
            }}
          >
            {buttonBody}
          </div>
        ) : (
          <a
            className="block-canvas__button-box"
            href={blockProps.href || '#'}
            target={blockProps.target || '_self'}
            rel={blockProps.target === '_blank' ? 'noopener noreferrer' : undefined}
            style={{
              width: isFullWidth ? '100%' : undefined,
              backgroundColor: blockProps.backgroundColor,
              color: blockProps.color,
              padding: `${tokens.paddingBlock} ${tokens.paddingInline}`,
              borderRadius: tokens.borderRadius,
            }}
          >
            {buttonBody}
          </a>
        )}
      </div>
    );
  }

  if (block.type === 'spacer') {
    return (
      <div
        className={isDesignMode ? 'block-canvas__spacer block-canvas__spacer--design' : 'block-canvas__spacer'}
        style={{ height: tokens.height, marginTop: 0, marginBottom: 0 }}
      />
    );
  }

  if (block.type === 'divider') {
    return (
      <div style={commonStyle}>
        <div className="block-canvas__divider" style={{ height: tokens.borderWidth, backgroundColor: blockProps.color }} />
      </div>
    );
  }

  if (block.type === 'group') {
    return (
      <div
        className="block-canvas__group"
        style={{
          ...commonStyle,
        }}
      >
        <div
          className="block-canvas__group-surface"
          style={{
            backgroundColor: blockProps.backgroundColor || undefined,
            borderRadius: tokens.borderRadius,
          }}
        />
        <div
          className="block-canvas__group-content"
          style={{
            padding: tokens.padding,
          }}
        >
          <ChildDropContainer
            block={block}
            blocks={block.children || []}
            isDesignMode={isDesignMode}
            label="Drop block here"
            renderBlockList={renderBlockList}
            gap={tokens.gap}
          />
        </div>
      </div>
    );
  }

  if (block.type === 'columns' || block.type === 'columns3') {
    return (
      <div
        className={`block-canvas__columns ${getPropClassNames(blockProps, ['verticalAlign'])}${preview === 'mobile' && blockProps.stackOnMobile === 'yes' ? ' block-canvas__columns--stacked' : ''}`.trim()}
        style={{
          ...commonStyle,
          gap: tokens.gap,
          backgroundColor: blockProps.backgroundColor || undefined,
          gridTemplateColumns: block.type === 'columns3' ? 'repeat(3, minmax(0, 1fr))' : undefined,
        }}
      >
        {(block.children || []).map((column) => (
          <ColumnDropArea
            key={column.id}
            column={column}
            isDesignMode={isDesignMode}
            renderBlockList={renderBlockList}
          />
        ))}
      </div>
    );
  }

  if (!LEAF_BLOCK_TYPES.has(block.type) && definition?.supportsChildren) {
    return (
      <ChildDropContainer
        block={block}
        blocks={block.children || []}
        isDesignMode={isDesignMode}
        label="Drop block here"
        renderBlockList={renderBlockList}
      />
    );
  }

  return null;
}
