export function BlockNode({
  block,
  isSelected,
  isDragging,
  attributes,
  listeners,
  setNodeRef,
  style,
  onSelectBlock,
  selectedParentId = '',
  selectedParentLabel = '',
  selectedLabel = '',
  children,
}) {
  return (
    <div
      ref={setNodeRef}
      className={`block-canvas__block${isSelected ? ' block-canvas__block--selected block-canvas__block--draggable' : ''}${isDragging ? ' block-canvas__block--dragging' : ''}`}
      data-testid={`block-container-${block.type}`}
      data-block-id={block.id}
      style={style}
      {...(isSelected ? attributes : {})}
      {...(isSelected ? listeners : {})}
      onClick={(event) => {
        event.stopPropagation();
        onSelectBlock(block.id);
      }}
    >
      {isSelected && selectedLabel ? (
        <div className="block-canvas__selected-badge" aria-hidden="true">
          {selectedParentLabel ? (
            <>
              <button
                type="button"
                className="block-canvas__selected-badge-parent"
                data-testid="selected-parent-button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (selectedParentId) {
                    onSelectBlock(selectedParentId);
                  }
                }}
              >
                {selectedParentLabel}
              </button>
              <span className="block-canvas__selected-badge-separator">/</span>
            </>
          ) : null}
          <strong className="block-canvas__selected-badge-label">{selectedLabel}</strong>
        </div>
      ) : null}
      {children}
    </div>
  );
}
