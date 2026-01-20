import { NgModule } from '@angular/core';
import { RouterModule, Routes, NoPreloading } from '@angular/router';

const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  { path: 'quran', loadChildren: () => import('./quran/quran.module').then(m => m.QuranModule) },
  { path: 'profile', loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule) },
  { path: 'quran2', loadChildren: () => import('./quran2/quran2.module').then(m => m.Quran2Module) },

  // ✅ keep default route
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth' }
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
