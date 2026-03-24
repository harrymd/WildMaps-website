/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BUCKET_URL?: string;
  readonly VITE_TILE_BUCKET_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
