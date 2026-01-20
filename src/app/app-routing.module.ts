import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  { path: 'quran', loadChildren: () => import('./quran/quran.module').then(m => m.QuranModule) },
  { path: 'profile', loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule) },
    { path: 'quran2', loadChildren: () => import('./quran2/quran2.module').then(m => m.Quran2Module) }, // Default route

  { path: '', redirectTo: 'quran2', pathMatch: 'full' },
  { path: '**', redirectTo: 'quran2' } // Wildcard route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
