import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage'

import { HomePage } from '../../pages/home/home'
import { LoginPage } from '../../pages/login/login'

import { LocationTracker } from '../../providers/location-tracker'
import { AuthService } from '../../providers/auth-service'

@Component({
  selector: 'page-init',
  templateUrl: 'init.html',
})
export class InitPage {
  title_page = 'Inicio'

  constructor(public navCtrl: NavController, 
      private location: LocationTracker,
      private storage: Storage,
      public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Init');
  }

  iniciar(){
    this.navCtrl.setRoot(HomePage)
    this.location.backgroundTracking()
  }

  logout(){
    this.storage.remove(AuthService.login_key)
    this.storage.remove(AuthService.token_key)
    this.storage.remove(AuthService.expiration_date_key)
    this.navCtrl.setRoot(LoginPage)
  }
}
