import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideNzI18n } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient,withFetch } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import {
  AppleOutline, AppstoreFill, AppstoreOutline, ArrowRightOutline, BarsOutline, BookOutline,
  CheckCircleFill, CheckOutline, CloseCircleFill, CloseOutline, DeleteOutline, DownloadOutline,
  DownOutline, EditOutline, EyeInvisibleOutline, EyeOutline, FolderAddOutline, FolderOutline,
  GoogleOutline, HeartOutline, HomeOutline, InfoCircleOutline, LeftOutline, LoadingOutline,
  LoginOutline, LogoutOutline, MenuOutline, MessageOutline, PlayCircleOutline, RightOutline,
  SearchOutline, SendOutline, UploadOutline, UserOutline
} from '@ant-design/icons-angular/icons';

// Bundle the icons the app uses so NG-ZORRO doesn't fetch each SVG over HTTP at runtime.
const icons = [
  AppleOutline, AppstoreFill, AppstoreOutline, ArrowRightOutline, BarsOutline, BookOutline,
  CheckCircleFill, CheckOutline, CloseCircleFill, CloseOutline, DeleteOutline, DownloadOutline,
  DownOutline, EditOutline, EyeInvisibleOutline, EyeOutline, FolderAddOutline, FolderOutline,
  GoogleOutline, HeartOutline, HomeOutline, InfoCircleOutline, LeftOutline, LoadingOutline,
  LoginOutline, LogoutOutline, MenuOutline, MessageOutline, PlayCircleOutline, RightOutline,
  SearchOutline, SendOutline, UploadOutline, UserOutline
];

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    provideClientHydration(withEventReplay()),
    provideNzI18n(en_US),
    provideNzIcons(icons),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()) // Enable fetch API
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
