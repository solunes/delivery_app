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
  subjectResult = new Subject<any>() 
  subjectCurrent = new Subject<any>() 

  constructor(public zone: NgZone,
    public geolocation: Geolocation,
    public http: HttpClient,
    public loading: LoadingClient,
    public backgroundGeolocation: BackgroundGeolocation) {
    
  }

  getCurrentPosition(){
    let options = {
      frequency: 5000, 
      enableHighAccuracy: true
    }
    console.log('options')

    this.geolocation.getCurrentPosition().then(value => {
      console.log('getCurrentPosition')
      this.subjectCurrent.next(value)
    })
  }

  backgroundTracking(interval=15000, user_id=1, uuid='') {
    console.log('BackgroundGeolocation: ')
    
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
      console.log('next')
      console.log(JSON.stringify(location))
    }, (err) => console.log(err))
    
    this.backgroundGeolocation.start()
  }

  sendPosition(lat, lng, acy){
    let endpoint = AppSettings.updateLocation(lat, lng, acy)
    this.http.getRequest(endpoint).subscribe(result => {
      console.log('result')
      console.log(JSON.stringify(result))
    }, error => this.loading.showError(error))
  }

  getResult(): Observable<any>{
    console.log('get result')
    return this.subjectResult.asObservable()
  }

  getCurrentObservable(): Observable<any>{
    console.log('get result')
    return this.subjectCurrent.asObservable()
  }

  stopBackgroundTracking() {
    console.log('stopBackgroundTracking')
    this.backgroundGeolocation.finish()
    this.backgroundGeolocation.stop()
  }
}
