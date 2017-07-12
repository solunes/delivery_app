import { Component, Input, Output, EventEmitter } from '@angular/core'
import { AuthService } from '../providers/auth-service'
import { Storage } from '@ionic/storage'
import { NavController} from 'ionic-angular'

// import { NotificationPage } from '../pages/notification/notification'
import { LoginPage } from '../pages/login/login'

import { AppSettings } from '../providers/app-settings'

@Component({
  selector: 'toolbar',
  template: `
  <ion-header>
      <ion-navbar>
        <button ion-button menuToggle>
            <ion-icon name="menu"></ion-icon>
        </button>
        <ion-title>
            {{ title_page }}
        </ion-title>

        <ion-buttons end >
          <button ion-button *ngIf="loading"><ion-spinner icon="android"></ion-spinner></button>
          <button ion-button *ngIf="logged" (click)="logout()">Logout <ion-icon name="log-out"></ion-icon></button>
        </ion-buttons>
      </ion-navbar>
  </ion-header>
`
})
export class ToolbarComponent{
  @Input() title_page: string = 'Toolbar'
  @Input() loading: boolean = false
  @Input() logged: boolean = false

  constructor(private navCtrl: NavController, 
      private auth: AuthService, 
      private storage: Storage){
    storage.ready().then(() => {
      storage.get(AuthService.login_key).then(value => {
        this.logged = value
      })
    })
  }

  // public showNotifi(){
  //   this.navCtrl.push(NotificationPage)
  // }

  logout(){
    this.auth.logout().subscribe(succ => {
      this.storage.remove(AuthService.login_key)
      this.storage.remove(AuthService.token_key)
      this.storage.remove(AuthService.expiration_date_key)
      this.navCtrl.setRoot(LoginPage)
    })
  }
}