import { getBlockStyleTokens } from './blockStyles';

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttribute(value = '') {
  return escapeHtml(value);
}

function styleString(styleObject) {
  const toCssProperty = (key) => key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

  return Object.entries(styleObject)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${toCssProperty(key)}:${value}`)
    .join(';');
}

function textToHtml(value = '') {
  return escapeHtml(value).replaceAll('\n', '<br>');
}

function isZeroSpace(value) {
  return !value || value === '0' || value === '0px';
}

function hasOuterSpacing(tokens) {
  return !isZeroSpace(tokens.marginTop) || !isZeroSpace(tokens.marginBottom);
}

function getAlignValue(textAlign) {
  if (textAlign === 'center' || textAlign === 'right') {
    return textAlign;
  }

  return 'left';
}

function getButtonAlign(justifyContent) {
  if (justifyContent === 'center') {
    return 'center';
  }

  if (justifyContent === 'flex-end') {
    return 'right';
  }

  return 'left';
}

function getVAlign(verticalAlign) {
  if (verticalAlign === 'middle') {
    return 'middle';
  }

  if (verticalAlign === 'bottom') {
    return 'bottom';
  }

  return 'top';
}

function wrapRows(rowsHtml) {
  if (!rowsHtml.trim()) {
    return '';
  }

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    ${rowsHtml}
  </table>`;
}

function wrapBlockRow(content, tokens) {
  return `<tr>
    <td style="${styleString({
      paddingTop: tokens.marginTop,
      paddingBottom: tokens.marginBottom,
    })}">
      ${content}
    </td>
  </tr>`;
}

function renderHeading(block) {
  const props = block.props || {};
  const tokens = getBlockStyleTokens(props);

  return `<h2 style="${styleString({
    margin: '0',
    color: props.color,
    fontFamily: props.fontFamily,
    textAlign: getAlignValue(props.textAlign),
    fontSize: tokens.fontSize,
    fontWeight: props.fontWeight === 'medium' ? '600' : props.fontWeight === 'bold' ? '700' : '400',
    lineHeight: '1.2',
  })}">${textToHtml(props.content)}</h2>`;
}

function renderText(block) {
  const props = block.props || {};
  const tokens = getBlockStyleTokens(props);

  return `<p style="${styleString({
    margin: '0',
    color: props.color,
    fontFamily: props.fontFamily,
    textAlign: getAlignValue(props.textAlign),
    fontSize: tokens.fontSize,
    lineHeight: tokens.lineHeight,
  })}">${textToHtml(props.content)}</p>`;
}

function renderImage(block) {
  const props = block.props || {};
  const tokens = getBlockStyleTokens(props);
  const align = getAlignValue(props.textAlign);
  const imageWidth = parseInt(tokens.width, 10);

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="${align}">
        <img src="${escapeAttribute(props.src)}" alt="${escapeAttribute(props.alt)}" ${Number.isFinite(imageWidth) ? `width="${imageWidth}"` : ''} style="${styleString({
          display: 'block',
          width: tokens.width,
          maxWidth: '100%',
          borderRadius: tokens.borderRadius,
          border: '0',
          outline: 'none',
          textDecoration: 'none',
          height: 'auto',
        })}">
      </td>
    </tr>
  </table>`;
}

function renderButton(block) {
  const props = block.props || {};
  const tokens = getBlockStyleTokens(props);
  const align = getButtonAlign(props.justifyContent);
  const isFullWidth = props.width === 'full';

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="${align}">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" ${isFullWidth ? 'width="100%"' : ''}>
          <tr>
            <td>
              <a href="${escapeAttribute(props.href || '#')}" style="${styleString({
                display: 'block',
                backgroundColor: props.backgroundColor,
                color: props.color,
                fontFamily: props.fontFamily,
                paddingTop: tokens.paddingTop,
                paddingBottom: tokens.paddingBottom,
                paddingLeft: tokens.paddingLeft,
                paddingRight: tokens.paddingRight,
                borderRadius: tokens.borderRadius,
                textDecoration: 'none',
                fontWeight: '700',
                textAlign: 'center',
              })}">${escapeHtml(props.label)}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function renderSpacer(block) {
  const tokens = getBlockStyleTokens(block.props || {});
  const spacerHeight = parseInt(tokens.height, 10) || 0;

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td height="${spacerHeight}" style="${styleString({
        fontSize: '0',
        lineHeight: '0',
        height: tokens.height,
      })}">&nbsp;</td>
    </tr>
  </table>`;
}

function renderDivider(block) {
  const props = block.props || {};
  const tokens = getBlockStyleTokens(props);

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td style="${styleString({
        fontSize: '0',
        lineHeight: '0',
        borderTop: `${tokens.borderWidth} solid ${props.color}`,
      })}">&nbsp;</td>
    </tr>
  </table>`;
}

function renderCellBlocks(blocks, mode) {
  if (!blocks.length) {
    return '';
  }

  if (blocks.length === 1) {
    const block = blocks[0];
    const tokens = getBlockStyleTokens(block.props || {});

    if (!hasOuterSpacing(tokens)) {
      return renderBlockContent(block, mode);
    }
  }

  return wrapRows(blocks.map((block) => renderBlockRow(block, mode)).join(''));
}

function renderGroup(block, mode) {
  const props = block.props || {};
  const tokens = getBlockStyleTokens(props);

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="${styleString({
    backgroundColor: props.backgroundColor || undefined,
    borderRadius: tokens.borderRadius,
  })}">
    <tr>
      <td style="${styleString({
        padding: tokens.padding,
      })}">
        ${renderCellBlocks(block.children || [], mode)}
      </td>
    </tr>
  </table>`;
}

function renderColumns(block, mode) {
  const props = block.props || {};
  const tokens = getBlockStyleTokens(props);
  const columnCount = block.type === 'columns3' ? 3 : 2;
  const children = block.children || [];

  const width = `${100 / columnCount}%`;

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="${styleString({
    backgroundColor: props.backgroundColor || undefined,
  })}">
    <tr>
      ${children.map((column, index) => `<td width="${width}" valign="${getVAlign(props.verticalAlign)}" style="${styleString({
        paddingRight: index < children.length - 1 ? tokens.gap : undefined,
      })}">
        ${renderCellBlocks(column.children || [], mode)}
      </td>`).join('')}
    </tr>
  </table>`;
}

function renderBlockContent(block, mode) {
  if (block.type === 'heading') {
    return renderHeading(block);
  }

  if (block.type === 'text') {
    return renderText(block);
  }

  if (block.type === 'image') {
    return renderImage(block);
  }

  if (block.type === 'button') {
    return renderButton(block);
  }

  if (block.type === 'spacer') {
    return renderSpacer(block);
  }

  if (block.type === 'divider') {
    return renderDivider(block);
  }

  if (block.type === 'group') {
    return renderGroup(block, mode);
  }

  if (block.type === 'columns' || block.type === 'columns3') {
    return renderColumns(block, mode);
  }

  return '';
}

function renderBlockRow(block, mode) {
  const tokens = getBlockStyleTokens(block.props || {});
  return wrapBlockRow(renderBlockContent(block, mode), tokens);
}

function renderDocumentContent(blocks, mode) {
  return renderCellBlocks(blocks, mode);
}

export function exportDocumentToHtml(blocks) {
  if (!blocks.length) {
    return '';
  }

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;background-color:#ffffff;">
  <tr>
    <td align="center" style="padding:0;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:100%;max-width:640px;">
        <tr>
          <td style="padding:0;">
            ${renderDocumentContent(blocks, 'desktop')}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}
