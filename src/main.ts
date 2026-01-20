import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

// 🔴 ADD THIS
window.onerror = function (message, source, lineno, colno, error) {
  console.log('🔥 GLOBAL ERROR');
  console.log({ message, source, lineno, colno, error });
};

window.onunhandledrejection = function (event) {
  console.log('🔥 UNHANDLED PROMISE');
  console.log(event.reason);
};

platformBrowserDynamic()
  .bootstrapModule(AppModule, {
    ngZoneEventCoalescing: true,
  })
  .catch(err => console.error(err));
