export const SIZE_OPTIONS = ['none', 'xs', 'sm', 'md', 'lg', 'xl'];

export const SIZE_LABELS = {
  none: 'None',
  xs: 'XS',
  sm: 'SM',
  md: 'MD',
  lg: 'LG',
  xl: 'XL',
};

export const FONT_SIZE_SCALE = {
  none: '0px',
  xs: '12px',
  sm: '14px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};

export const SPACE_SCALE = {
  none: '0px',
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};

export const RADIUS_SCALE = {
  none: '0px',
  xs: '2px',
  sm: '4px',
  md: '8px',
  lg: '14px',
  xl: '20px',
};

export const GAP_SCALE = {
  none: '0px',
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};

export const WIDTH_SCALE = {
  xs: '160px',
  sm: '220px',
  md: '320px',
  lg: '480px',
  xl: '640px',
  full: '100%',
};

export const LINE_HEIGHT_SCALE = {
  none: 0,
  xs: 1.2,
  sm: 1.35,
  md: 1.5,
  lg: 1.65,
  xl: 1.8,
};

export const BORDER_SCALE = {
  none: '0px',
  xs: '1px',
  sm: '1px',
  md: '2px',
  lg: '3px',
  xl: '4px',
};

export function getScaleValue(scale, token, fallback) {
  return scale[token] || fallback;
}
