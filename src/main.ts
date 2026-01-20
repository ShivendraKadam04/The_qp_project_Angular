import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

window.addEventListener('error', (e) => {
  console.error('Global uncaught error:', e.message, e.filename, e.lineno);
});

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
