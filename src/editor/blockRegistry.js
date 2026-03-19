const ALIGN_OPTIONS = ['left', 'center', 'right'];
const WEIGHT_OPTIONS = ['normal', 'medium', 'bold'];
const WIDTH_OPTIONS = ['xs', 'sm', 'md', 'lg', 'xl', 'full'];
const VERTICAL_ALIGN_OPTIONS = ['top', 'middle', 'bottom', 'stretch'];
const BUTTON_WIDTH_OPTIONS = ['auto', 'full'];
const BUTTON_JUSTIFY_OPTIONS = [
  { value: 'flex-start', label: 'left' },
  { value: 'center', label: 'center' },
  { value: 'flex-end', label: 'right' },
];
const TARGET_OPTIONS = [
  { value: '_self', label: 'Same tab' },
  { value: '_blank', label: 'New tab' },
];
const STACK_OPTIONS = ['yes', 'no'];
const SIZE_OPTIONS = ['none', 'xs', 'sm', 'md', 'lg', 'xl'];

function sizeControl(label) {
  return {
    type: 'select',
    label,
    options: SIZE_OPTIONS,
  };
}

function defineBlock({
  type,
  label,
  category,
  supportsChildren = false,
  allowedChildren,
  insertable = true,
  createChildren,
  propGroups = {},
}) {
  const controlGroups = ['content', 'style', 'behavior'].map((groupName) => {
    const group = propGroups[groupName] || {};
    return {
      name: groupName,
      label: group.label || groupName[0].toUpperCase() + groupName.slice(1),
      controls: group.controls || [],
    };
  });

  const defaultProps = controlGroups.reduce((result, group) => ({
    ...result,
    ...(propGroups[group.name]?.defaultProps || {}),
  }), {});

  return {
    type,
    label,
    category,
    supportsChildren,
    allowedChildren,
    insertable,
    createChildren,
    defaultProps,
    controlGroups,
    controls: controlGroups.flatMap((group) => group.controls),
  };
}

export const BLOCK_DEFINITIONS = {
  heading: defineBlock({
    type: 'heading',
    label: 'Heading',
    category: 'Content',
    propGroups: {
      content: {
        defaultProps: {
          content: 'Email headline',
        },
        controls: [
          { name: 'content', type: 'textarea', label: 'Content' },
        ],
      },
      style: {
        defaultProps: {
          textAlign: 'left',
          color: '#201c1b',
          fontSize: 'xl',
          fontWeight: 'bold',
        },
        controls: [
          { name: 'textAlign', type: 'segmented', label: 'Alignment', options: ALIGN_OPTIONS },
          { name: 'fontSize', ...sizeControl('Font size') },
          { name: 'fontWeight', type: 'select', label: 'Weight', options: WEIGHT_OPTIONS },
          { name: 'color', type: 'color', label: 'Color' },
          { name: 'marginTop', ...sizeControl('Top spacing') },
          { name: 'marginBottom', ...sizeControl('Bottom spacing') },
        ],
      },
    },
  }),
  text: defineBlock({
    type: 'text',
    label: 'Text',
    category: 'Content',
    propGroups: {
      content: {
        defaultProps: {
          content: 'Write your email copy here.',
        },
        controls: [
          { name: 'content', type: 'textarea', label: 'Content' },
        ],
      },
      style: {
        defaultProps: {
          textAlign: 'left',
          color: '#4f4a47',
          fontSize: 'md',
          lineHeight: 'md',
        },
        controls: [
          { name: 'textAlign', type: 'segmented', label: 'Alignment', options: ALIGN_OPTIONS },
          { name: 'fontSize', ...sizeControl('Font size') },
          { name: 'lineHeight', ...sizeControl('Line height') },
          { name: 'color', type: 'color', label: 'Color' },
          { name: 'marginTop', ...sizeControl('Top spacing') },
          { name: 'marginBottom', ...sizeControl('Bottom spacing') },
        ],
      },
    },
  }),
  image: defineBlock({
    type: 'image',
    label: 'Image',
    category: 'Media',
    propGroups: {
      content: {
        defaultProps: {
          src: 'https://placehold.co/640x320/f4efe8/201c1b?text=Image',
          alt: 'Email image',
        },
        controls: [
          { name: 'src', type: 'url', label: 'Source URL' },
          { name: 'alt', type: 'text', label: 'Alt text' },
        ],
      },
      style: {
        defaultProps: {
          textAlign: 'center',
          width: 'xl',
          borderRadius: 'sm',
        },
        controls: [
          { name: 'textAlign', type: 'segmented', label: 'Alignment', options: ALIGN_OPTIONS },
          { name: 'width', type: 'select', label: 'Width', options: WIDTH_OPTIONS },
          { name: 'borderRadius', ...sizeControl('Corner radius') },
          { name: 'marginTop', ...sizeControl('Top spacing') },
          { name: 'marginBottom', ...sizeControl('Bottom spacing') },
        ],
      },
    },
  }),
  button: defineBlock({
    type: 'button',
    label: 'Button',
    category: 'Actions',
    propGroups: {
      content: {
        defaultProps: {
          label: 'Call to action',
          href: 'https://example.com',
          target: '_blank',
        },
        controls: [
          { name: 'label', type: 'text', label: 'Label' },
          { name: 'href', type: 'url', label: 'Link URL' },
        ],
      },
      style: {
        defaultProps: {
          justifyContent: 'flex-start',
          width: 'auto',
          backgroundColor: '#201c1b',
          color: '#fffaf5',
          paddingInline: 'lg',
          paddingBlock: 'sm',
          borderRadius: 'md',
        },
        controls: [
          { name: 'justifyContent', type: 'segmented', label: 'Alignment', options: BUTTON_JUSTIFY_OPTIONS },
          { name: 'width', type: 'select', label: 'Width', options: BUTTON_WIDTH_OPTIONS },
          { name: 'backgroundColor', type: 'color', label: 'Background color' },
          { name: 'color', type: 'color', label: 'Text color' },
          { name: 'paddingInline', ...sizeControl('Horizontal padding') },
          { name: 'paddingBlock', ...sizeControl('Vertical padding') },
          { name: 'borderRadius', ...sizeControl('Corner radius') },
          { name: 'marginTop', ...sizeControl('Top spacing') },
          { name: 'marginBottom', ...sizeControl('Bottom spacing') },
        ],
      },
      behavior: {
        controls: [
          { name: 'target', type: 'select', label: 'Open link in', options: TARGET_OPTIONS },
        ],
      },
    },
  }),
  spacer: defineBlock({
    type: 'spacer',
    label: 'Spacer',
    category: 'Layout',
    propGroups: {
      style: {
        defaultProps: {
          height: 'lg',
        },
        controls: [
          { name: 'height', ...sizeControl('Height') },
        ],
      },
    },
  }),
  divider: defineBlock({
    type: 'divider',
    label: 'Divider',
    category: 'Layout',
    propGroups: {
      style: {
        defaultProps: {
          color: '#d9d2c7',
          borderWidth: 'xs',
        },
        controls: [
          { name: 'color', type: 'color', label: 'Line color' },
          { name: 'borderWidth', ...sizeControl('Thickness') },
          { name: 'marginTop', ...sizeControl('Top spacing') },
          { name: 'marginBottom', ...sizeControl('Bottom spacing') },
        ],
      },
    },
  }),
  group: defineBlock({
    type: 'group',
    label: 'Group',
    category: 'Layout',
    supportsChildren: true,
    propGroups: {
      style: {
        defaultProps: {
          backgroundColor: '',
          padding: 'none',
          gap: 'none',
          borderRadius: 'md',
          marginTop: 'none',
          marginBottom: 'none',
        },
        controls: [
          { name: 'backgroundColor', type: 'color', label: 'Background color' },
          { name: 'padding', ...sizeControl('Padding') },
          { name: 'gap', ...sizeControl('Inner gap') },
          { name: 'borderRadius', ...sizeControl('Corner radius') },
          { name: 'marginTop', ...sizeControl('Top spacing') },
          { name: 'marginBottom', ...sizeControl('Bottom spacing') },
        ],
      },
    },
  }),
  columns: defineBlock({
    type: 'columns',
    label: '2 Columns',
    category: 'Layout',
    supportsChildren: true,
    allowedChildren: ['column'],
    createChildren: () => [{ type: 'column' }, { type: 'column' }],
    propGroups: {
      style: {
        defaultProps: {
          backgroundColor: '',
          gap: 'none',
          marginTop: 'none',
          marginBottom: 'none',
        },
        controls: [
          { name: 'backgroundColor', type: 'color', label: 'Background color' },
          { name: 'gap', ...sizeControl('Column gap') },
          { name: 'marginTop', ...sizeControl('Top spacing') },
          { name: 'marginBottom', ...sizeControl('Bottom spacing') },
        ],
      },
      behavior: {
        defaultProps: {
          verticalAlign: 'top',
          stackOnMobile: 'yes',
        },
        controls: [
          { name: 'verticalAlign', type: 'select', label: 'Vertical align', options: VERTICAL_ALIGN_OPTIONS },
          { name: 'stackOnMobile', type: 'select', label: 'Stack on mobile', options: STACK_OPTIONS },
        ],
      },
    },
  }),
  columns3: defineBlock({
    type: 'columns3',
    label: '3 Columns',
    category: 'Layout',
    supportsChildren: true,
    allowedChildren: ['column'],
    createChildren: () => [{ type: 'column' }, { type: 'column' }, { type: 'column' }],
    propGroups: {
      style: {
        defaultProps: {
          backgroundColor: '',
          gap: 'none',
          marginTop: 'none',
          marginBottom: 'none',
        },
        controls: [
          { name: 'backgroundColor', type: 'color', label: 'Background color' },
          { name: 'gap', ...sizeControl('Column gap') },
          { name: 'marginTop', ...sizeControl('Top spacing') },
          { name: 'marginBottom', ...sizeControl('Bottom spacing') },
        ],
      },
      behavior: {
        defaultProps: {
          verticalAlign: 'top',
          stackOnMobile: 'yes',
        },
        controls: [
          { name: 'verticalAlign', type: 'select', label: 'Vertical align', options: VERTICAL_ALIGN_OPTIONS },
          { name: 'stackOnMobile', type: 'select', label: 'Stack on mobile', options: STACK_OPTIONS },
        ],
      },
    },
  }),
  column: defineBlock({
    type: 'column',
    label: 'Column',
    category: 'Layout',
    insertable: false,
    supportsChildren: true,
  }),
};

export function getBlockDefinition(type) {
  return BLOCK_DEFINITIONS[type];
}

export function getInsertableBlocks() {
  return Object.values(BLOCK_DEFINITIONS)
    .filter((definition) => definition.insertable !== false)
    .sort((left, right) => left.category.localeCompare(right.category) || left.label.localeCompare(right.label));
}

export function getBlockControls(definition) {
  return definition?.controls || [];
}
