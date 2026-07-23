// FIX: Cloudflare bindings type declarations
// These are injected by the Workers runtime at runtime

interface CloudflareEnv {
  DB: D1Database;
}

declare module '@cloudflare/next-on-pages' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Env extends CloudflareEnv {}
}
