import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { ToastController, LoadingController, Loading } from 'ionic-angular';
import 'rxjs/add/operator/map';

/*
  Generated class for the LoadingClient provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class LoadingClient {
  loading: Loading;
  loading_page: boolean = false
  is_present: boolean = false

  constructor(public http: Http, 
    public loadingCtrl: LoadingController, 
    public toastCtrl: ToastController) {}

  showLoading(last_id:any=undefined){
    if (last_id) {
      this.loading_page = true
    } else {
      this.loading = this.loadingCtrl.create({
        content: "Por favor espere..."
      });
      this.is_present = true
      this.loading.present();
    }
  }

  showLoadingText(text){
    this.loading = this.loadingCtrl.create({
      content: text
    });
    this.loading.present();
  }

  showError(text){
    this.dismiss();
    const toast = this.toastCtrl.create({
      message: text,
            duration: 3000,
      showCloseButton: false,
      closeButtonText: 'OK'
    });
    //toast.present();
  }

  presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 5000
    });
    toast.present();
  }

  dismiss(){
    if (this.is_present) {
      this.loading.dismiss()
      this.is_present = false
    } else {
      this.loading_page = false
    }
  }
}
