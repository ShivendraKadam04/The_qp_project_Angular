import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuranComponent } from './quran/quran.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ChaptersComponent } from './chapters/chapters.component';
import { ProfileComponent } from './profile/profile.component';
import { CollectionComponent } from './collection/collection.component';
import { AppendiceComponent } from './appendice/appendice.component';
import { AboutusComponent } from './aboutus/aboutus.component';

const routes: Routes = [
  { 
    path: '', component: QuranComponent, children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'chapters', component: ChaptersComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'collection', component: CollectionComponent },
      { path: 'appendice', component: AppendiceComponent },
      { path: 'aboutus', component: AboutusComponent },
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
        { path: '**', redirectTo: '/dashboard' } // Wildcard route

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuranRoutingModule { }
