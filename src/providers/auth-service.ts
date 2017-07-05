import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { AppSettings } from './app-settings'

export class User {
  name: string; 
  email: string;

  constructor(name: string, email: string) {
    this.name = name;
    this.email = email;
  }
}

@Injectable()
export class AuthService {
  static login_key: string = 'login'
  static token_key: string = 'token'
  static user_id_key: string = 'user_id'
  static expiration_date_key: string = 'expirationDate'
  timeout_page:number = 10000

  constructor(private http: Http) {}

  public login(credentials) {
    if (credentials.email === null || credentials.email === null) {
      return Observable.throw("please insert credentials");
    } else {
      let body = new FormData();
      body.append('email', credentials.email);
      body.append('password', credentials.password);
      return this.http.post(AppSettings.api_url + '-auth/authenticate', body)
          .timeout(this.timeout_page).map(res => res.json());
    }
  }

  public logout() {
    return Observable.create(observer => {
      observer.next(true);
      observer.complete();
    });
  }
}
