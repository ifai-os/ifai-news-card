/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_BASE_URL?: string;
  readonly VITE_OPENAI_API_KEY?: string;
  readonly VITE_OPENAI_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __APP_CONFIG__?: {
    VITE_OPENAI_BASE_URL?: string;
    VITE_OPENAI_API_KEY?: string;
    VITE_OPENAI_MODEL?: string;
  };
}
