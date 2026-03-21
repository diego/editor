import { BlockNode } from './BlockNode';
import { BlockRenderer } from './BlockRenderer';

function StaticBlockList({ blocks, preview }) {
  return (
    <div className="block-canvas__list">
      {blocks.map((block) => (
        <BlockNode
          key={block.id}
          block={block}
          isSelected={false}
          isDragging={false}
          onSelectBlock={() => {}}
        >
          <BlockRenderer
            block={block}
            preview={preview}
            isDesignMode={false}
            onPatchBlock={() => {}}
            onSelectBlock={() => {}}
            renderBlockList={(childBlocks) => <StaticBlockList blocks={childBlocks} preview={preview} />}
          />
        </BlockNode>
      ))}
    </div>
  );
}

export function BlockDragPreview({ block, preview = 'desktop' }) {
  return (
    <div className="block-canvas__drag-preview">
      <BlockNode
        block={block}
        isSelected={false}
        isDragging={false}
        onSelectBlock={() => {}}
      >
        <BlockRenderer
          block={block}
          preview={preview}
          isDesignMode={false}
          onPatchBlock={() => {}}
          onSelectBlock={() => {}}
          renderBlockList={(childBlocks) => <StaticBlockList blocks={childBlocks} preview={preview} />}
        />
      </BlockNode>
    </div>
  );
}
