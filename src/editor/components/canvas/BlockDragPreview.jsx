import { getBlockDefinition } from '../../blockRegistry';
import { BlockContainer } from './BlockContainer';
import { BlockRenderer } from './BlockRenderer';

function StaticBlockList({ blocks, preview }) {
  return (
    <div className="block-canvas__list block-canvas__list--design">
      {blocks.map((block) => (
        <BlockContainer
          key={block.id}
          block={block}
          definition={getBlockDefinition(block.type)}
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
            showDropZones={false}
          />
        </BlockContainer>
      ))}
    </div>
  );
}

export function BlockDragPreview({ block, preview = 'desktop' }) {
  return (
    <div className="block-canvas__drag-preview">
      <BlockContainer
        block={block}
        definition={getBlockDefinition(block.type)}
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
          showDropZones={false}
        />
      </BlockContainer>
    </div>
  );
}
