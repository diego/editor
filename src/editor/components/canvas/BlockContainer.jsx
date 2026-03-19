export function BlockContainer({
  block,
  definition,
  isSelected,
  isDragging,
  attributes,
  listeners,
  setNodeRef,
  style,
  onSelectBlock,
  children,
}) {
  return (
    <article
      ref={setNodeRef}
      className={`block-canvas__container block-canvas__container--${block.type}${isSelected ? ' block-canvas__container--selected block-canvas__container--draggable' : ''}${isDragging ? ' block-canvas__container--dragging' : ''}`}
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
      <header className="block-canvas__container-header">
        <span className="block-canvas__container-category">{definition.category}</span>
        <span className="block-canvas__container-label">{definition.label}</span>
      </header>
      <div className="block-canvas__container-body">
        {children}
      </div>
    </article>
  );
}
