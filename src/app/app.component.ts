import { Component } from '@angular/core';
import { Platform, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage'
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import {
  Push,
  PushToken, IPushMessage
} from '@ionic/cloud-angular';

import { InitPage } from '../pages/init/init';
import { LoginPage } from '../pages/login/login';

import { AppSettings } from '../providers/app-settings';
import { AuthService } from '../providers/auth-service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;

  constructor(platform: Platform, public alertCtrl: AlertController, private push: Push, storage: Storage, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      if (platform.is('cordova')) {
        statusBar.styleDefault();
        splashScreen.hide();
        this.initPush()
      }
      storage.get(AuthService.login_key).then(value => {
        if (value) {
          this.rootPage = InitPage
        } else {
          this.rootPage = LoginPage
        }
      })
    });
  }

  public initPush() {
    this.push.register().then((t: PushToken) => {
      return this.push.saveToken(t);
    }).then((t: PushToken) => {
      this.push.saveToken(t);
      console.log('Token saved:', t.token);
    });
 
    this.push.rx.notification().subscribe((data:IPushMessage) => {
      console.log('I received awesome push: ' + JSON.stringify(data));
      console.log('Foreground: ' +data['raw']);
      console.log('Foreground: ' +data['raw'].additionalData);
      if (data.raw.additionalData.foreground) {
        let confirmAlert = this.alertCtrl.create({
          title: 'Nueva notificación',
          message: data.raw.message,
          buttons: [{
            text: 'Ignorar',
            role: 'cancel'
          }, {
            text: 'Ver',
            handler: () => {
              //TODO: Your logic here
              //this.nav.setRoot(NotificationPage, {message: data.raw.message});
            }
          }]
        });
        confirmAlert.present();
      } else {
        //this.nav.setRoot(NotificationPage, {message: data.raw.message});
      }
    });
  }
}

