import {
  BORDER_SCALE,
  FONT_SIZE_SCALE,
  GAP_SCALE,
  LINE_HEIGHT_SCALE,
  RADIUS_SCALE,
  SIZE_OPTIONS,
  SPACE_SCALE,
  WIDTH_SCALE,
} from './designTokens';

const ALIGN_OPTIONS = ['left', 'center', 'right'];
const WEIGHT_OPTIONS = ['normal', 'medium', 'bold'];
const WIDTH_OPTIONS = ['xs', 'sm', 'md', 'lg', 'xl', 'full'];
const VERTICAL_ALIGN_OPTIONS = ['top', 'middle', 'bottom', 'stretch'];
const BUTTON_WIDTH_OPTIONS = ['auto', 'full'];

function sizeControl(label) {
  return {
    type: 'select',
    label,
    options: SIZE_OPTIONS,
  };
}

function baseSpacingControls() {
  return [
    { name: 'marginTop', ...sizeControl('Top spacing') },
    { name: 'marginBottom', ...sizeControl('Bottom spacing') },
  ];
}

export const BLOCK_DEFINITIONS = {
  heading: {
    type: 'heading',
    label: 'Heading',
    category: 'Content',
    defaultProps: {
      content: 'Email headline',
      align: 'left',
      color: '#201c1b',
      fontSize: 'xl',
      fontWeight: 'bold',
    },
    supportsChildren: false,
    controls: [
      { name: 'content', type: 'textarea', label: 'Content' },
      { name: 'align', type: 'segmented', label: 'Alignment', options: ALIGN_OPTIONS },
      { name: 'fontSize', ...sizeControl('Font size') },
      { name: 'fontWeight', type: 'select', label: 'Weight', options: WEIGHT_OPTIONS },
      { name: 'color', type: 'color', label: 'Color' },
      ...baseSpacingControls(),
    ],
  },
  text: {
    type: 'text',
    label: 'Text',
    category: 'Content',
    defaultProps: {
      content: 'Write your email copy here.',
      align: 'left',
      color: '#4f4a47',
      fontSize: 'md',
      lineHeight: 'md',
    },
    supportsChildren: false,
    controls: [
      { name: 'content', type: 'textarea', label: 'Content' },
      { name: 'align', type: 'segmented', label: 'Alignment', options: ALIGN_OPTIONS },
      { name: 'fontSize', ...sizeControl('Font size') },
      { name: 'lineHeight', ...sizeControl('Line height') },
      { name: 'color', type: 'color', label: 'Color' },
      ...baseSpacingControls(),
    ],
  },
  image: {
    type: 'image',
    label: 'Image',
    category: 'Media',
    defaultProps: {
      src: 'https://placehold.co/640x320/f4efe8/201c1b?text=Image',
      alt: 'Email image',
      align: 'center',
      width: 'xl',
      radius: 'sm',
    },
    supportsChildren: false,
    controls: [
      { name: 'src', type: 'url', label: 'Source URL' },
      { name: 'alt', type: 'text', label: 'Alt text' },
      { name: 'align', type: 'segmented', label: 'Alignment', options: ALIGN_OPTIONS },
      { name: 'width', type: 'select', label: 'Width', options: WIDTH_OPTIONS },
      { name: 'radius', ...sizeControl('Corner radius') },
      ...baseSpacingControls(),
    ],
  },
  button: {
    type: 'button',
    label: 'Button',
    category: 'Actions',
    defaultProps: {
      label: 'Call to action',
      href: 'https://example.com',
      align: 'left',
      width: 'auto',
      background: '#201c1b',
      textColor: '#fffaf5',
      paddingX: 'lg',
      paddingY: 'sm',
      radius: 'md',
    },
    supportsChildren: false,
    controls: [
      { name: 'label', type: 'text', label: 'Label' },
      { name: 'href', type: 'url', label: 'Link URL' },
      { name: 'align', type: 'segmented', label: 'Alignment', options: ALIGN_OPTIONS },
      { name: 'width', type: 'select', label: 'Width', options: BUTTON_WIDTH_OPTIONS },
      { name: 'background', type: 'color', label: 'Background' },
      { name: 'textColor', type: 'color', label: 'Text color' },
      { name: 'paddingX', ...sizeControl('Horizontal padding') },
      { name: 'paddingY', ...sizeControl('Vertical padding') },
      { name: 'radius', ...sizeControl('Corner radius') },
      ...baseSpacingControls(),
    ],
  },
  spacer: {
    type: 'spacer',
    label: 'Spacer',
    category: 'Layout',
    defaultProps: {
      height: 'lg',
    },
    supportsChildren: false,
    controls: [
      { name: 'height', ...sizeControl('Height') },
    ],
  },
  divider: {
    type: 'divider',
    label: 'Divider',
    category: 'Layout',
    defaultProps: {
      color: '#d9d2c7',
      thickness: 'xs',
    },
    supportsChildren: false,
    controls: [
      { name: 'color', type: 'color', label: 'Line color' },
      { name: 'thickness', ...sizeControl('Thickness') },
      ...baseSpacingControls(),
    ],
  },
  group: {
    type: 'group',
    label: 'Group',
    category: 'Layout',
    defaultProps: {
      radius: 'md',
    },
    supportsChildren: true,
    controls: [
      { name: 'background', type: 'color', label: 'Background' },
      { name: 'padding', ...sizeControl('Padding') },
      { name: 'gap', ...sizeControl('Inner gap') },
      { name: 'radius', ...sizeControl('Corner radius') },
      ...baseSpacingControls(),
    ],
  },
  columns: {
    type: 'columns',
    label: '2 Columns',
    category: 'Layout',
    defaultProps: {
      background: '',
      stackOnMobile: 'yes',
      verticalAlign: 'top',
    },
    supportsChildren: true,
    allowedChildren: ['column'],
    createChildren: () => [
      { type: 'column' },
      { type: 'column' },
    ],
    controls: [
      { name: 'background', type: 'color', label: 'Background' },
      { name: 'gap', ...sizeControl('Column gap') },
      { name: 'verticalAlign', type: 'select', label: 'Vertical align', options: VERTICAL_ALIGN_OPTIONS },
      { name: 'stackOnMobile', type: 'select', label: 'Stack on mobile', options: ['yes', 'no'] },
      ...baseSpacingControls(),
    ],
  },
  columns3: {
    type: 'columns3',
    label: '3 Columns',
    category: 'Layout',
    defaultProps: {
      background: '',
      stackOnMobile: 'yes',
      verticalAlign: 'top',
    },
    supportsChildren: true,
    allowedChildren: ['column'],
    createChildren: () => [
      { type: 'column' },
      { type: 'column' },
      { type: 'column' },
    ],
    controls: [
      { name: 'background', type: 'color', label: 'Background' },
      { name: 'gap', ...sizeControl('Column gap') },
      { name: 'verticalAlign', type: 'select', label: 'Vertical align', options: VERTICAL_ALIGN_OPTIONS },
      { name: 'stackOnMobile', type: 'select', label: 'Stack on mobile', options: ['yes', 'no'] },
      ...baseSpacingControls(),
    ],
  },
  column: {
    type: 'column',
    label: 'Column',
    category: 'Layout',
    insertable: false,
    defaultProps: {},
    supportsChildren: true,
    controls: [],
  },
};

export function getBlockDefinition(type) {
  return BLOCK_DEFINITIONS[type];
}

export function getInsertableBlocks() {
  return Object.values(BLOCK_DEFINITIONS)
    .filter((definition) => definition.insertable !== false)
    .sort((left, right) => left.category.localeCompare(right.category) || left.label.localeCompare(right.label));
}

export function getBlockStyleTokens(props = {}) {
  return {
    marginTop: SPACE_SCALE[props.marginTop] || '0px',
    marginBottom: SPACE_SCALE[props.marginBottom] || '0px',
    padding: SPACE_SCALE[props.padding] || '0px',
    height: SPACE_SCALE[props.height] || SPACE_SCALE.md,
    gap: GAP_SCALE[props.gap] || '0px',
    radius: RADIUS_SCALE[props.radius] || '0px',
    fontSize: FONT_SIZE_SCALE[props.fontSize] || FONT_SIZE_SCALE.md,
    lineHeight: LINE_HEIGHT_SCALE[props.lineHeight] || LINE_HEIGHT_SCALE.md,
    width: WIDTH_SCALE[props.width] || WIDTH_SCALE.full,
    contentWidth: WIDTH_SCALE[props.contentWidth] || WIDTH_SCALE.full,
    paddingX: SPACE_SCALE[props.paddingX] || SPACE_SCALE.md,
    paddingY: SPACE_SCALE[props.paddingY] || SPACE_SCALE.sm,
    borderWidth: BORDER_SCALE[props.borderWidth || props.thickness] || BORDER_SCALE.xs,
  };
}
