import { useDroppable } from '@dnd-kit/core';

export function BlockDropZone({
  containerId,
  index,
  label,
  disabled = false,
  role = 'inner',
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop:${containerId}:${index}:${role}`,
    disabled,
    data: {
      kind: 'container',
      containerId,
      index,
      source: 'drop-zone',
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`block-canvas__drop-zone${isOver ? ' block-canvas__drop-zone--over' : ''}`}
      data-testid={`drop-zone-${role}-${containerId}-${index}`}
    >
      <span>{label}</span>
    </div>
  );
}
