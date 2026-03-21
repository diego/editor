export const EDITOR_MESSAGE_TYPES = {
  ready: 'editor:ready',
  init: 'editor:init',
  save: 'editor:save',
};

export function createHostSession() {
  return {
    origin: '',
    context: null,
    requestId: '',
    source: '',
  };
}

export function hasHostOpener() {
  return typeof window !== 'undefined' && Boolean(window.opener) && !window.opener.closed;
}

export function postEditorReady() {
  if (!hasHostOpener()) {
    return;
  }

  window.opener.postMessage({
    type: EDITOR_MESSAGE_TYPES.ready,
  }, '*');
}

export function postEditorSave({ document, html, mode, session }) {
  if (!hasHostOpener() || !session.origin) {
    return false;
  }

  window.opener.postMessage({
    type: EDITOR_MESSAGE_TYPES.save,
    payload: {
      document,
      html,
      mode,
      context: session.context,
      requestId: session.requestId,
      source: session.source,
    },
  }, session.origin);

  return true;
}

export function getInitMessagePayload(event) {
  if (!hasHostOpener() || event.source !== window.opener || !event.data || typeof event.data !== 'object') {
    return null;
  }

  if (event.data.type !== EDITOR_MESSAGE_TYPES.init) {
    return null;
  }

  const payload = event.data.payload || {};

  return {
    origin: event.origin,
    document: payload.document,
    mode: payload.mode,
    context: payload.context ?? null,
    requestId: typeof payload.requestId === 'string' ? payload.requestId : '',
    source: typeof payload.source === 'string' ? payload.source : '',
  };
}
