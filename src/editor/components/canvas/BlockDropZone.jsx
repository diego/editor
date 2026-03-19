import { useDroppable } from '@dnd-kit/core';

export function BlockDropZone({
  containerId,
  index,
  label,
  disabled = false,
  hasContent = false,
  role = 'inner',
  separated = false,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop:${containerId}:${index}:${role}`,
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
      className={`block-canvas__drop-zone${separated ? ' block-canvas__drop-zone--separated' : ''}${hasContent ? ' block-canvas__drop-zone--with-content' : ''}${isOver ? ' block-canvas__drop-zone--over' : ''}`}
      data-testid={`drop-zone-${role}-${containerId}-${index}`}
    >
      <span>{label}</span>
    </div>
  );
}
