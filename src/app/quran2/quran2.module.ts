import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Quran2RoutingModule } from './quran2-routing.module';
import { Quran2Component } from './quran2.component';

import { DashboardComponent } from './dashboard/dashboard.component';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { ChaptersComponent } from './chapters/chapters.component';
import { ProfileComponent } from './profile/profile.component';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CollectionComponent } from './collection/collection.component';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { AppendiceComponent } from './appendice/appendice.component';
import { AboutusComponent } from './aboutus/aboutus.component';

@NgModule({
  declarations: [
    Quran2Component,
      DashboardComponent,
       
        ChaptersComponent,
        ProfileComponent,
        CollectionComponent,
        AppendiceComponent,
        AboutusComponent
  ],
  imports: [
    CommonModule,
    Quran2RoutingModule,
     CommonModule,
    FormsModule, // Added for ngModel
    NzButtonModule,
    NzEmptyModule,
    NzInputModule,
   
    NzModalModule,
    NzCheckboxModule,
    NzBreadCrumbModule,
    NzIconModule,
    NzMenuModule,
    NzDropDownModule,
    NzLayoutModule,
    NzSpinModule,
    NzPopoverModule,
    NzTabsModule,
    NzFormModule,
    NzSelectModule,
    NzAutocompleteModule, // Added for autocomplete
    ReactiveFormsModule,
    NzCollapseModule
  ]
})
export class Quran2Module { }
