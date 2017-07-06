import { Component } from '@angular/core'
import { NavController } from 'ionic-angular'
import { Geoposition } from '@ionic-native/geolocation';
import { Storage } from '@ionic/storage'
import {
 GoogleMaps,
 GoogleMap,
 GoogleMapsEvent,
 LatLng,
 CameraPosition,
 MarkerOptions,
 Marker
} from '@ionic-native/google-maps'

import { LocationTracker } from '../../providers/location-tracker'
import { LoadingClient } from '../../providers/loading-client'
import { AuthService } from '../../providers/auth-service'
import { AppSettings } from '../../providers/app-settings'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  title_page = 'Home'
  map: GoogleMap
  delivery_position: Marker
  label: number = 0
  on_background: boolean

  constructor(public navCtrl: NavController,
    private location: LocationTracker,
    private storage: Storage,
    private loading: LoadingClient, 
    private googleMaps: GoogleMaps) {

    this.location.getResult().subscribe(data => {
      this.loading.dismiss()
      this.addMarker(data.latitude, data.longitude)
    })

    this.location.getCurrentObservable().subscribe((value:Geoposition) => {
      this.addMarker(value.coords.latitude, value.coords.longitude)
    })

  }

  ionViewWillEnter(){
    console.log('view init')
    this.loadMap();
  }

  ionViewWillLeave(){
    this.location.stopBackgroundTracking()
  }

  loadMap(){
    let element = document.getElementById('map')
    this.map = this.googleMaps.create(element)

    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      console.log('Map is ready!')
      this.location.getCurrentPosition()
    })
  }

  addMarker(lat, lng){
    let latLng: LatLng = new LatLng(lat, lng)

    let position: CameraPosition = {
      target: latLng,
      zoom: 18,
      tilt: 30
    }
    let markerOptions: MarkerOptions = {
      position: latLng,
      title: 'current position'
    }

    this.map.moveCamera(position)
    if (!this.delivery_position) {
      this.map.addMarker(markerOptions).then((marker: Marker) => {
          this.delivery_position = marker
          this.delivery_position.showInfoWindow()
        })
    } else {
      this.label++
      this.delivery_position.setTitle(this.label.toString())
      this.delivery_position.showInfoWindow()
      this.delivery_position.setPosition(latLng)
    }
  }

  init(){
    this.on_background = true
    this.loading.showLoading(true)
    this.location.backgroundTracking()
  }

  finish(){
    this.on_background = false
    this.location.stopBackgroundTracking()
  }
}
