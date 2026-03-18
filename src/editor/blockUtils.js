import { getBlockDefinition } from './blockRegistry';

export const ROOT_CONTAINER_ID = 'root';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createId(type) {
  return `${type}_${Math.random().toString(36).slice(2, 9)}`;
}

export function cloneDocument(blocks) {
  return clone(blocks);
}

export function createBlock(type, override = {}) {
  const definition = getBlockDefinition(type);
  if (!definition) {
    throw new Error(`Unknown block type: ${type}`);
  }

  const block = {
    id: createId(type),
    type,
    props: {
      ...(definition.defaultProps || {}),
      ...(override.props || {}),
    },
  };

  if (definition.supportsChildren) {
    const templateChildren = override.children || definition.createChildren?.() || [];
    block.children = templateChildren.map((child) => createBlock(child.type, child));
  }

  return block;
}

export function createInitialDocument() {
  return [];
}

export function findBlock(blocks, blockId, containerId = ROOT_CONTAINER_ID) {
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    if (block.id === blockId) {
      return { block, index, containerId };
    }

    if (block.children?.length) {
      const nested = findBlock(block.children, blockId, block.id);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

export function findContainer(blocks, containerId) {
  if (containerId === ROOT_CONTAINER_ID) {
    return blocks;
  }

  const located = findBlock(blocks, containerId);
  return located?.block.children || null;
}

export function getChildContainerLength(blocks, containerId) {
  const container = findContainer(blocks, containerId);
  return container ? container.length : 0;
}

export function updateBlockProps(blocks, blockId, patch) {
  const located = findBlock(blocks, blockId);
  if (located) {
    located.block.props = {
      ...located.block.props,
      ...patch,
    };
  }
  return blocks;
}

export function insertBlock(blocks, containerId, index, block) {
  const container = findContainer(blocks, containerId);
  if (!container) {
    return blocks;
  }

  container.splice(index, 0, block);
  return blocks;
}

export function removeBlock(blocks, blockId) {
  const located = findBlock(blocks, blockId);
  if (!located) {
    return blocks;
  }

  const container = findContainer(blocks, located.containerId);
  if (!container) {
    return blocks;
  }

  container.splice(located.index, 1);
  return blocks;
}

export function moveBlock(blocks, blockId, targetContainerId, targetIndex) {
  const located = findBlock(blocks, blockId);
  if (!located) {
    return blocks;
  }

  const sourceContainer = findContainer(blocks, located.containerId);
  const targetContainer = findContainer(blocks, targetContainerId);
  if (!sourceContainer || !targetContainer) {
    return blocks;
  }

  const [moved] = sourceContainer.splice(located.index, 1);
  if (!moved) {
    return blocks;
  }

  let nextIndex = targetIndex;
  if (located.containerId === targetContainerId && located.index < targetIndex) {
    nextIndex -= 1;
  }

  targetContainer.splice(nextIndex, 0, moved);
  return blocks;
}

export function isDescendantBlock(blocks, ancestorId, candidateContainerId) {
  if (candidateContainerId === ROOT_CONTAINER_ID) {
    return false;
  }

  const ancestor = findBlock(blocks, ancestorId)?.block;
  if (!ancestor?.children?.length) {
    return false;
  }

  return Boolean(findBlock(ancestor.children, candidateContainerId));
}

export function canAcceptChild(containerType, childType) {
  const definition = getBlockDefinition(containerType);
  if (!definition?.supportsChildren) {
    return false;
  }

  if (!definition.allowedChildren?.length) {
    return true;
  }

  return definition.allowedChildren.includes(childType);
}

export function getDropTargetFromOver(over) {
  if (!over?.data?.current) {
    return null;
  }

  const data = over.data.current;
  if (data.kind === 'container') {
    return { containerId: data.containerId, index: data.index };
  }

  if (data.kind === 'block') {
    return { containerId: data.containerId, index: data.index };
  }

  return null;
}
