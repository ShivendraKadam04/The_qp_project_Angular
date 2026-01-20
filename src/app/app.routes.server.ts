import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // ✅ Do NOT prerender everything for a dynamic SPA
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
