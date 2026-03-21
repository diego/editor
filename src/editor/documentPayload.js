import { getBlockDefinition } from './blockRegistry';

export const DOCUMENT_VERSION = 1;

function createId(type) {
  return `${type}_${Math.random().toString(36).slice(2, 9)}`;
}

function getAllowedOptionValues(control) {
  return Array.isArray(control.options)
    ? control.options.map((option) => (typeof option === 'string' ? option : option.value))
    : null;
}

function sanitizeBlockProps(definition, rawProps = {}) {
  return definition.controls.reduce((sanitizedProps, control) => {
    const defaultValue = definition.defaultProps?.[control.name];
    const incomingValue = rawProps?.[control.name];
    const allowedValues = getAllowedOptionValues(control);
    const isValidEnum = !allowedValues || allowedValues.includes(incomingValue);

    sanitizedProps[control.name] = typeof incomingValue === 'string' && isValidEnum
      ? incomingValue
      : defaultValue;

    return sanitizedProps;
  }, { ...(definition.defaultProps || {}) });
}

function sanitizeBlockChildren(definition, rawChildren) {
  const incomingChildren = Array.isArray(rawChildren) ? rawChildren : [];
  const sanitizedChildren = incomingChildren
    .map((child) => sanitizeBlock(child))
    .filter(Boolean)
    .filter((child) => !definition.allowedChildren?.length || definition.allowedChildren.includes(child.type));

  if (sanitizedChildren.length) {
    return sanitizedChildren;
  }

  if (definition.createChildren) {
    return definition.createChildren()
      .map((child) => sanitizeBlock(child))
      .filter(Boolean);
  }

  return [];
}

function sanitizeBlock(rawBlock) {
  if (!rawBlock || typeof rawBlock !== 'object' || Array.isArray(rawBlock)) {
    return null;
  }

  const definition = getBlockDefinition(rawBlock.type);
  if (!definition) {
    return null;
  }

  const block = {
    id: typeof rawBlock.id === 'string' && rawBlock.id ? rawBlock.id : createId(definition.type),
    type: definition.type,
    props: sanitizeBlockProps(definition, rawBlock.props),
  };

  if (definition.supportsChildren) {
    block.children = sanitizeBlockChildren(definition, rawBlock.children);
  }

  return block;
}

function sanitizeBlocks(blocks) {
  if (!Array.isArray(blocks)) {
    return [];
  }

  return blocks
    .map((block) => sanitizeBlock(block))
    .filter(Boolean)
    .filter((block) => getBlockDefinition(block.type)?.insertable !== false);
}

export function serializeEditorDocument(blocks) {
  return {
    version: DOCUMENT_VERSION,
    blocks,
  };
}

export function parseEditorDocument(input) {
  if (!input || typeof input !== 'object') {
    return [];
  }

  if (input.version !== DOCUMENT_VERSION || !Array.isArray(input.blocks)) {
    return [];
  }

  return sanitizeBlocks(input.blocks);
}
