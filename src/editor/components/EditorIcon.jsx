import headingIcon from '../icons/heading.svg';
import textIcon from '../icons/text.svg';
import imageIcon from '../icons/image.svg';
import buttonIcon from '../icons/button.svg';
import spacerIcon from '../icons/spacer.svg';
import dividerIcon from '../icons/divider.svg';
import groupIcon from '../icons/group.svg';
import columnsIcon from '../icons/columns.svg';
import columns3Icon from '../icons/columns3.svg';
import designIcon from '../icons/design.svg';
import desktopIcon from '../icons/desktop.svg';
import mobileIcon from '../icons/mobile.svg';
import resetIcon from '../icons/reset.svg';
import deleteIcon from '../icons/delete.svg';

const ICONS = {
  heading: headingIcon,
  text: textIcon,
  image: imageIcon,
  button: buttonIcon,
  spacer: spacerIcon,
  divider: dividerIcon,
  group: groupIcon,
  columns: columnsIcon,
  columns3: columns3Icon,
  design: designIcon,
  desktop: desktopIcon,
  mobile: mobileIcon,
  reset: resetIcon,
  delete: deleteIcon,
};

export function EditorIcon({ name, className = '', size = 18 }) {
  const src = ICONS[name];

  if (!src) {
    return null;
  }

  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        width: size,
        height: size,
        display: 'inline-block',
        backgroundColor: 'currentColor',
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        flex: '0 0 auto',
      }}
    />
  );
}
