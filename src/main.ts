import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

// 🔴 ADD THIS
console.log('✅ BOOT: main.ts loaded');

window.addEventListener('error', (e: any) => {
  console.log('🔥 WINDOW ERROR:', e?.message, e?.filename, e?.lineno, e?.colno, e?.error);
}, true);

window.addEventListener('unhandledrejection', (e: any) => {
  console.log('🔥 UNHANDLED REJECTION:', e?.reason);
});