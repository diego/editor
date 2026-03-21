import headingIcon from '../icons/heading.svg?raw';
import textIcon from '../icons/text.svg?raw';
import imageIcon from '../icons/image.svg?raw';
import buttonIcon from '../icons/button.svg?raw';
import spacerIcon from '../icons/spacer.svg?raw';
import dividerIcon from '../icons/divider.svg?raw';
import groupIcon from '../icons/group.svg?raw';
import columnsIcon from '../icons/columns.svg?raw';
import columns3Icon from '../icons/columns3.svg?raw';
import desktopIcon from '../icons/desktop.svg?raw';
import mobileIcon from '../icons/mobile.svg?raw';
import resetIcon from '../icons/reset.svg?raw';
import deleteIcon from '../icons/delete.svg?raw';
import copyIcon from '../icons/copy.svg?raw';
import checkIcon from '../icons/check.svg?raw';

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
  desktop: desktopIcon,
  mobile: mobileIcon,
  reset: resetIcon,
  delete: deleteIcon,
  copy: copyIcon,
  check: checkIcon,
};

export function EditorIcon({ name, className = '', size = 18 }) {
  const markup = ICONS[name];

  if (!markup) {
    return null;
  }

  return (
    <span
      aria-hidden="true"
      className={className}
      dangerouslySetInnerHTML={{ __html: markup }}
      style={{
        width: size,
        height: size,
        display: 'inline-block',
        lineHeight: 0,
        flex: '0 0 auto',
      }}
    />
  );
}
