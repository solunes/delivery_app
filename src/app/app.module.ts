import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule, LOCALE_ID } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Geolocation } from '@ionic-native/geolocation';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { GoogleMaps } from '@ionic-native/google-maps'
import { IonicStorageModule } from '@ionic/storage';
import { HttpModule } from '@angular/http';
import { CallNumber } from '@ionic-native/call-number'
import { CloudSettings, CloudModule } from '@ionic/cloud-angular'

import { MyApp } from './app.component';
import { ToolbarComponent } from './toolbar.component';

import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { InitPage } from '../pages/init/init';

import { LocationTracker } from '../providers/location-tracker';
import { AppSettings } from '../providers/app-settings';
import { AuthService } from '../providers/auth-service';
import { HttpClient } from '../providers/http-client';
import { LoadingClient } from '../providers/loading-client';

const cloudSettings: CloudSettings = {
  'core': {
    'app_id': '55d109a5'
  },
  'push': {
    'sender_id': '680425155654',
    'pluginConfig': {
      'ios': {
        'badge': true,
        'sound': true
      },
      'android': {
        'iconColor': '#ff0000'
      }
    }
  }
}

@NgModule({
  declarations: [
    MyApp,
    ToolbarComponent,
    HomePage,
    LoginPage,
    InitPage,
  ],
  imports: [
    HttpModule,
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    CloudModule.forRoot(cloudSettings)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ToolbarComponent,
    HomePage,
    LoginPage,
    InitPage,
  ], 
  providers: [
    StatusBar,
    GoogleMaps,
    Geolocation,
    BackgroundGeolocation,
    LocationTracker,
    AppSettings,
    CallNumber,
    AuthService,
    HttpClient,
    LoadingClient,
    SplashScreen,
    {provide: LOCALE_ID, useValue: 'es-ES'},
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
