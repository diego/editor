import { useEffect, useRef } from 'react';

export function EditableText({ value, className = '', style, onChange, onFocus }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || document.activeElement === node) {
      return;
    }

    const nextValue = value ?? '';
    if (node.innerText !== nextValue) {
      node.innerText = nextValue;
    }
  }, [value]);

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      contentEditable={Boolean(onChange)}
      suppressContentEditableWarning={Boolean(onChange)}
      spellCheck={false}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onFocus={onFocus}
      onInput={onChange ? (event) => onChange(String(event.currentTarget.innerText ?? '').replace(/\r\n/g, '\n')) : undefined}
    />
  );
}
