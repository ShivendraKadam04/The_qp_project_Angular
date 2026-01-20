import { NgModule } from '@angular/core';
import { RouterModule, Routes, NoPreloading } from '@angular/router';

const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  { path: 'quran', loadChildren: () => import('./quran/quran.module').then(m => m.QuranModule) },
  { path: 'profile', loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule) },

  // ✅ keep default route
  { path: '', redirectTo: 'quran', pathMatch: 'full' },
  { path: '**', redirectTo: 'quran' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // ✅ important for iOS: don't preload heavy lazy routes
      preloadingStrategy: NoPreloading,

      // ✅ if a chunk fails / route fails, you’ll see it in console
      errorHandler: (err) => {
        console.error('🔥 ROUTER ERROR:', err);
      },

      // optional: helps some WebKit timing issues
      // initialNavigation: 'enabledBlocking',
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
