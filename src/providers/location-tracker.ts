import { Injectable, NgZone } from '@angular/core'
import { BackgroundGeolocation } from '@ionic-native/background-geolocation'
import { Geolocation, Geoposition } from '@ionic-native/geolocation'
import { Observable, Subscription, Subject } from 'rxjs/Rx'

import { AppSettings } from '../providers/app-settings'
import { HttpClient } from '../providers/http-client'
import { LoadingClient } from '../providers/loading-client'
/*
  Generated class for the LocationTracker provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class LocationTracker {

  watch: any
  stringTest: string 
  subjectResult: Subject<any>
  subjectCurrent: Subject<any>
  subjectDeliveres: Subject<JSON>

  constructor(public zone: NgZone,
    public geolocation: Geolocation,
    public http: HttpClient,
    public loading: LoadingClient,
    public backgroundGeolocation: BackgroundGeolocation) {
    
  }

  getCurrentPosition(){
    console.log('getCurrentPosition')
    let options = {
      frequency: 1000, 
      enableHighAccuracy: true
    }
    this.geolocation.getCurrentPosition().then(value => {
      console.log('value')
      console.log(value)
      this.subjectCurrent.next(value)
      this.subjectCurrent.complete()
    })
  }

  backgroundTracking(interval=15000, user_id=1, uuid='') {
    let config = {
      desiredAccuracy: 0,
      stationaryRadius: 5,
      distanceFilter: 5, 
      debug: false,
      interval: interval,
      stopOnTerminate: true,
      stopOnStillActivity: true,
      notificationTitle: 'Esperando la ubicación',
      notificationText: 'delivery'
    }
   
    this.backgroundGeolocation.configure(config).subscribe((location) => {
      this.sendPosition(location.latitude, location.longitude,location.accuracy)
      this.subjectResult.next(location)
    }, (err) => console.log(err))
    
    this.backgroundGeolocation.start()
  }

  sendPosition(lat, lng, acy){
    let endpoint = AppSettings.updateLocation(lat, lng, acy)
    this.http.getRequest(endpoint).subscribe(result => {
      this.subjectDeliveres.next(result)
    }, error => this.loading.showError(error))
  }

  getResult(): Observable<any>{
    this.subjectResult = new Subject<any>()
    return this.subjectResult.asObservable()
  }

  getCurrentObservable(): Observable<any>{
    this.subjectCurrent = new Subject<any>()
    return this.subjectCurrent.asObservable()
  }

  getDeliveres(): Observable<any>{
    this.subjectDeliveres = new Subject<JSON>()
    return this.subjectDeliveres.asObservable()
  }

  stopBackgroundTracking() {
    console.log('stopBackgroundTracking')
    try {
      this.backgroundGeolocation.finish()
      this.backgroundGeolocation.stop()
    } catch (ex){
    } 
    this.subjectResult.complete()
    this.subjectDeliveres.complete()
  }
}
