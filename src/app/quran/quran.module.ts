import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuranRoutingModule } from './quran-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { QuranComponent } from './quran/quran.component';
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


@NgModule({
  declarations: [
    DashboardComponent,
    QuranComponent,
    ChaptersComponent,
    ProfileComponent
  ],
  imports: [
    CommonModule,
    QuranRoutingModule,
    NzModalModule,
    NzBreadCrumbModule,
    NzIconModule,
    NzMenuModule,
    NzDropDownModule,
    NzLayoutModule,
    NzSpinModule,
    NzPopoverModule

  ]
})
export class QuranModule { }
