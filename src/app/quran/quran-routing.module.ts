import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuranComponent } from './quran/quran.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ChaptersComponent } from './chapters/chapters.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  { 
    path: '', component: QuranComponent, children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'chapters', component: ChaptersComponent },
      { path: 'profile', component: ProfileComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuranRoutingModule { }
