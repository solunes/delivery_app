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

import { MyApp } from './app.component';
import { ToolbarComponent } from './toolbar.component';

import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';

import { LocationTracker } from '../providers/location-tracker';
import { AppSettings } from '../providers/app-settings';
import { AuthService } from '../providers/auth-service';
import { HttpClient } from '../providers/http-client';
import { LoadingClient } from '../providers/loading-client';

@NgModule({
  declarations: [
    MyApp,
    ToolbarComponent,
    HomePage,
    LoginPage,
  ],
  imports: [
    HttpModule,
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ToolbarComponent,
    HomePage,
    LoginPage,
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
