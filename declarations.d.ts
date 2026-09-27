// Type definitions
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY?: string;
    GEMINI_API_KEY?: string;
    [key: string]: string | undefined;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
};
