import {
  BORDER_SCALE,
  FONT_SIZE_SCALE,
  GAP_SCALE,
  LINE_HEIGHT_SCALE,
  RADIUS_SCALE,
  SPACE_SCALE,
  WIDTH_SCALE,
} from './designTokens';

export function getBlockStyleTokens(props = {}) {
  return {
    marginTop: SPACE_SCALE[props.marginTop] || '0px',
    marginBottom: SPACE_SCALE[props.marginBottom] || '0px',
    padding: SPACE_SCALE[props.padding] || '0px',
    height: SPACE_SCALE[props.height] || SPACE_SCALE.md,
    gap: GAP_SCALE[props.gap] || '0px',
    borderRadius: RADIUS_SCALE[props.borderRadius] || '0px',
    fontSize: FONT_SIZE_SCALE[props.fontSize] || FONT_SIZE_SCALE.md,
    lineHeight: LINE_HEIGHT_SCALE[props.lineHeight] || LINE_HEIGHT_SCALE.md,
    width: WIDTH_SCALE[props.width] || WIDTH_SCALE.full,
    paddingTop: SPACE_SCALE[props.paddingTop] || '0px',
    paddingBottom: SPACE_SCALE[props.paddingBottom] || '0px',
    paddingLeft: SPACE_SCALE[props.paddingLeft] || '0px',
    paddingRight: SPACE_SCALE[props.paddingRight] || '0px',
    borderWidth: BORDER_SCALE[props.borderWidth] || BORDER_SCALE.xs,
  };
}
