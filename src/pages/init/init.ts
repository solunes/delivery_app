import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Alert } from 'ionic-angular';
import { Storage } from '@ionic/storage'

import { HomePage } from '../../pages/home/home'
import { LoginPage } from '../../pages/login/login'

import { LocationTracker } from '../../providers/location-tracker'
import { AuthService } from '../../providers/auth-service'
import { LoadingClient } from '../../providers/loading-client'

@Component({
  selector: 'page-init',
  templateUrl: 'init.html',
})
export class InitPage {
  title_page = 'Inicio'
  confirmAlert: Alert

  constructor(public navCtrl: NavController, 
      private location: LocationTracker,
      private storage: Storage,
      private alert: AlertController,
      public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Init');
  }

  iniciar(){
    console.log(this.confirmAlert)
    this.confirmAlert = this.alert.create({
      title: 'Location settings',
      message: 'Es necesario la ubicación',
      buttons: [{
        text: 'Ignorar',
        role: 'cancel'
      }, {
        text: 'Abrir',
        handler: () => {
          this.location.backgroundGeolocation.showLocationSettings()
        }
      }]
    })
    this.location.backgroundGeolocation.isLocationEnabled().then(value => {
      if (value == 0) {
        this.confirmAlert.present()
      } else {
        this.navCtrl.push(HomePage)
      }
    })
  }

  logout(){
    this.storage.remove(AuthService.login_key)
    this.storage.remove(AuthService.token_key)
    this.storage.remove(AuthService.expiration_date_key)
    this.navCtrl.setRoot(LoginPage)
  }
}
