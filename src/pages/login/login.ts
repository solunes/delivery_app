import { Component } from '@angular/core'
import { Http } from '@angular/http'
import { Storage } from '@ionic/storage'
import { NavController, NavParams, Loading } from 'ionic-angular'
import { AuthService } from '../../providers/auth-service'
import { LoadingClient } from '../../providers/loading-client'
import { HttpClient } from '../../providers/http-client'
import { AppSettings } from '../../providers/app-settings'

import { HomePage } from '../../pages/home/home'

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  title_page: string = 'Iniciar Sesión'
  loginCredentials = {user: '', password: '', email: ''}
  register = {
    name: '', 
    email: '', 
    password: '', 
    city: '', 
    zone: '', 
    address: '', 
    phone: '', 
  }

  constructor(private nav: NavController, 
    private auth: AuthService, 
    private storage: Storage,
    private loading: LoadingClient,
    public http: Http,
    public httpClient: HttpClient,
    public navParam: NavParams) {
  }

  public login(){
    this.loading.showLoading()
    this.auth.login(this.loginCredentials).subscribe(allowed => {
      if (allowed) {
        this.loading.dismiss()
        this.handleResult(allowed)
      } else {
        this.loading.showError("Acceso denegado")
      }
    }, error => {
      this.loading.showError(error)
    })
  }

  onChange(event){
    console.log(event)
  }

  handleResult(data){
    console.log(data)
    this.storage.set(AuthService.login_key, true)
    this.storage.set(AuthService.token_key, data[AuthService.token_key])
    this.storage.set(AuthService.expiration_date_key, data[AuthService.expiration_date_key])
    this.nav.setRoot(HomePage)
  }
}
