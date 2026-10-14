export interface AppApi {
  openExternal(url: string): Promise<void>;
}

declare global {
  interface Window {
    api?: AppApi;
  }
}

function isExternalHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

// Browser fallback: when no preload bridge exists (a plain browser build, the
// office's renderer check), open links through the web platform. When the
// Electron preload bridge IS present, it wins.
function createBrowserApi(): AppApi {
  return {
    async openExternal(url: string): Promise<void> {
      if (typeof window === 'undefined' || !isExternalHttpUrl(url)) {
        return;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    },
  };
}

function resolveApi(): AppApi {
  if (typeof window !== 'undefined' && window.api) {
    return window.api;
  }
  return createBrowserApi();
}

export const api: AppApi = resolveApi();
