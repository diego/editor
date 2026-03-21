(function initHipsendEmailPreview(global) {
  const SCRIPT_SRC = document.currentScript && document.currentScript.src
    ? document.currentScript.src
    : '';
  const MESSAGE_TYPES = {
    ready: 'editor:ready',
    init: 'editor:init',
    save: 'editor:save',
  };
  const DEFAULT_DOCUMENT = { version: 1, blocks: [] };
  const DEFAULT_WINDOW_NAME = 'hipsend-email-editor';
  const DEFAULT_WINDOW_FEATURES = 'width=1440,height=920,resizable=yes,scrollbars=yes';
  const DEFAULT_MODE = 'desktop';
  const PREVIEW_STYLE_ID = 'hipsend-email-preview-styles';

  function resolveElement(target) {
    if (!target) {
      return null;
    }

    if (typeof target === 'string') {
      return document.querySelector(target);
    }

    return target instanceof Element ? target : null;
  }

  function resolveValue(value) {
    return typeof value === 'function' ? value() : value;
  }

  function createRequestId() {
    return `editor_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function getDefaultEditorUrl() {
    if (SCRIPT_SRC) {
      return new URL('/', SCRIPT_SRC).toString();
    }

    return new URL('/', global.location.href).toString();
  }

  function ensureStyles() {
    if (document.getElementById(PREVIEW_STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = PREVIEW_STYLE_ID;
    style.textContent = `
      .hipsend-email-preview {
        display: grid;
        gap: 14px;
        min-width: 0;
        padding: 18px;
        border: 1px solid rgba(95, 78, 64, 0.12);
        border-radius: 3px;
        background-image:
          radial-gradient(circle at 1px 1px, rgba(95, 78, 64, 0.14) 1px, transparent 0);
        background-size: 12px 12px;
        background-position: 0 0;
      }

      .hipsend-email-preview__toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .hipsend-email-preview__actions,
      .hipsend-email-preview__modes {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .hipsend-email-preview__button {
        appearance: none;
        border: 1px solid rgba(95, 78, 64, 0.16);
        border-radius: 3px;
        background: #ffffff;
        color: #201c1b;
        padding: 10px 12px;
        font: inherit;
        line-height: 1;
        cursor: pointer;
      }

      .hipsend-email-preview__button--active {
        background: #201c1b;
        color: #ffffff;
        border-color: #000000;
      }

      .hipsend-email-preview__canvas-wrap {
        min-width: 0;
      }

      .hipsend-email-preview__canvas {
        min-height: 720px;
        position: relative;
        margin: 0 auto;
        border: 10px solid #201c1b;
        border-radius: 28px;
        background: #ffffff;
        overflow: hidden;
        box-shadow: 0 12px 32px rgba(32, 28, 27, 0.08);
        transition: width 160ms ease;
      }

      .hipsend-email-preview__canvas::before,
      .hipsend-email-preview__canvas::after {
        content: "";
        position: absolute;
        pointer-events: none;
        z-index: 2;
      }

      .hipsend-email-preview__canvas::before {
        top: 10px;
        left: 50%;
        width: 88px;
        height: 8px;
        transform: translateX(-50%);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.42);
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08);
      }

      .hipsend-email-preview__canvas::after {
        inset: 8px;
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 20px;
      }

      .hipsend-email-preview__canvas--desktop {
        width: 100%;
        max-width: 640px;
      }

      .hipsend-email-preview__canvas--mobile {
        width: 100%;
        max-width: 390px;
        background-image: linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5));
        background-size: 120px 5px;
        background-position: center calc(100% - 12px);
        background-repeat: no-repeat;
      }

      .hipsend-email-preview__canvas-frame {
        display: block;
        width: 100%;
        min-height: 720px;
        border: 0;
        background: #ffffff;
      }
    `;

    document.head.appendChild(style);
  }

  function parseDocumentValue(value) {
    if (!value) {
      return DEFAULT_DOCUMENT;
    }

    if (typeof value === 'object') {
      return value;
    }

    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return DEFAULT_DOCUMENT;
      }
    }

    return DEFAULT_DOCUMENT;
  }

  function createButton(label, className) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    return button;
  }

  function setCanvasMode(canvas, desktopButton, mobileButton, mode) {
    canvas.classList.toggle('hipsend-email-preview__canvas--desktop', mode === 'desktop');
    canvas.classList.toggle('hipsend-email-preview__canvas--mobile', mode === 'mobile');
    desktopButton.classList.toggle('hipsend-email-preview__button--active', mode === 'desktop');
    mobileButton.classList.toggle('hipsend-email-preview__button--active', mode === 'mobile');
  }

  function createPreview(options) {
    ensureStyles();

    const root = resolveElement(options.container);
    const documentJson = resolveElement(options.documentJson);
    const documentHtml = resolveElement(options.documentHtml);

    if (!options?.container) {
      global.alert('Hipsend.preview requires a container.');
      return null;
    }

    if (!options?.documentJson) {
      global.alert('Hipsend.preview requires a documentJson input.');
      return null;
    }

    if (!options?.documentHtml) {
      global.alert('Hipsend.preview requires a documentHtml input.');
      return null;
    }

    if (!root) {
      global.alert('Hipsend.preview could not find the preview container.');
      return null;
    }

    if (!documentJson || !('value' in documentJson)) {
      global.alert('Hipsend.preview could not find the JSON input.');
      return null;
    }

    if (!documentHtml || !('value' in documentHtml)) {
      global.alert('Hipsend.preview could not find the HTML input.');
      return null;
    }

    const editorUrl = getDefaultEditorUrl();
    const editorOrigin = new URL(editorUrl, global.location.href).origin;
    const windowName = options.windowName || DEFAULT_WINDOW_NAME;
    const windowFeatures = options.windowFeatures || DEFAULT_WINDOW_FEATURES;

    let popupWindow = null;
    let activeRequestId = '';
    let currentMode = options.mode === 'mobile' ? 'mobile' : DEFAULT_MODE;

    root.innerHTML = '';
    root.classList.add('hipsend-email-preview');

    const toolbar = document.createElement('div');
    toolbar.className = 'hipsend-email-preview__toolbar';

    const actions = document.createElement('div');
    actions.className = 'hipsend-email-preview__actions';

    const modes = document.createElement('div');
    modes.className = 'hipsend-email-preview__modes';

    const editButton = createButton(options.editLabel || 'Open editor', 'hipsend-email-preview__button');
    const desktopButton = createButton('Desktop', 'hipsend-email-preview__button');
    const mobileButton = createButton('Mobile', 'hipsend-email-preview__button');

    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'hipsend-email-preview__canvas-wrap';

    const canvas = document.createElement('div');
    canvas.className = 'hipsend-email-preview__canvas';

    const canvasFrame = document.createElement('iframe');
    canvasFrame.className = 'hipsend-email-preview__canvas-frame';
    canvasFrame.setAttribute('title', 'Email preview');
    canvasFrame.setAttribute('scrolling', 'auto');

    canvas.appendChild(canvasFrame);
    canvasWrap.appendChild(canvas);
    actions.appendChild(editButton);
    modes.appendChild(desktopButton);
    modes.appendChild(mobileButton);
    toolbar.appendChild(actions);
    toolbar.appendChild(modes);
    root.appendChild(toolbar);
    root.appendChild(canvasWrap);

    function writeFrameContent(html) {
      const frameDocument = canvasFrame.contentWindow?.document;
      if (!frameDocument) {
        return;
      }

      const content = html || '<div style="padding:24px;color:#7f756c;font-family:Arial,sans-serif;font-size:14px;line-height:1.5;">No email designed yet.</div>';

      frameDocument.open();
      frameDocument.write(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#ffffff;">${content}</body></html>`);
      frameDocument.close();
    }

    function syncPreview(html) {
      writeFrameContent(html || '');
      documentHtml.value = html || '';
    }

    function syncDocument(payloadDocument) {
      documentJson.value = JSON.stringify(payloadDocument || DEFAULT_DOCUMENT);
    }

    function getInitialDocument() {
      const configured = resolveValue(options.document);
      if (configured) {
        return parseDocumentValue(configured);
      }

      if (documentJson.value) {
        return parseDocumentValue(documentJson.value);
      }

      return DEFAULT_DOCUMENT;
    }

    function open() {
      activeRequestId = createRequestId();
      popupWindow = global.open(editorUrl, windowName, windowFeatures);
      return popupWindow;
    }

    function handleMessage(event) {
      if (event.origin !== editorOrigin || !event.data || typeof event.data !== 'object') {
        return;
      }

      if (event.data.type === MESSAGE_TYPES.ready) {
        if (!popupWindow || popupWindow.closed) {
          return;
        }

        popupWindow.postMessage({
          type: MESSAGE_TYPES.init,
          payload: {
            document: getInitialDocument(),
            mode: currentMode,
            source: resolveValue(options.source) || 'embed',
            requestId: activeRequestId,
            context: resolveValue(options.context) || null,
          },
        }, editorOrigin);
      }

      if (event.data.type === MESSAGE_TYPES.save) {
        const payload = event.data.payload || {};
        if (payload.requestId && activeRequestId && payload.requestId !== activeRequestId) {
          return;
        }

        if (payload.mode === 'desktop' || payload.mode === 'mobile') {
          currentMode = payload.mode;
          setCanvasMode(canvas, desktopButton, mobileButton, currentMode);
        }

        syncDocument(payload.document || DEFAULT_DOCUMENT);
        syncPreview(payload.html || '');

        if (typeof options.onSave === 'function') {
          options.onSave(payload);
        }

        root.dispatchEvent(new CustomEvent('hipsend:email-preview-save', { detail: payload }));
      }
    }

    function handleDesktopMode() {
      currentMode = 'desktop';
      setCanvasMode(canvas, desktopButton, mobileButton, currentMode);
    }

    function handleMobileMode() {
      currentMode = 'mobile';
      setCanvasMode(canvas, desktopButton, mobileButton, currentMode);
    }

    editButton.addEventListener('click', open);
    desktopButton.addEventListener('click', handleDesktopMode);
    mobileButton.addEventListener('click', handleMobileMode);

    global.addEventListener('message', handleMessage);

    setCanvasMode(canvas, desktopButton, mobileButton, currentMode);
    syncPreview(resolveValue(options.html) || documentHtml.value || '');

    return {
      open,
      getDocument() {
        return parseDocumentValue(documentJson.value);
      },
      getHtml() {
        return documentHtml.value || '';
      },
      destroy() {
        global.removeEventListener('message', handleMessage);
        editButton.removeEventListener('click', open);
        desktopButton.removeEventListener('click', handleDesktopMode);
        mobileButton.removeEventListener('click', handleMobileMode);
        popupWindow = null;
      },
    };
  }

  global.Hipsend = global.Hipsend || {};
  global.Hipsend.preview = createPreview;
}(window));
