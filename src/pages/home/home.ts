import { Component } from '@angular/core'
import { NavController } from 'ionic-angular'
import { Geoposition } from '@ionic-native/geolocation';
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

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  map: GoogleMap
  delivery_position: Marker

  constructor(public navCtrl: NavController,
    private location: LocationTracker,
    private loading: LoadingClient, 
    private googleMaps: GoogleMaps) {

    this.location.getResult().subscribe(data => {
      this.delivery_position.setPosition(new LatLng(data.latitude,data.longitude))
      this.addMarker(data)
      this.loading.presentToast('new position ' + JSON.stringify(data))
      console.log(JSON.stringify(data))
    })

    this.location.getCurrentObservable().subscribe((value:Geoposition) => {
      
      console.log('getCurrentObservable')
      let ionic: LatLng = new LatLng(value.coords.latitude,value.coords.longitude)

      // create CameraPosition
      let position: CameraPosition = {
        target: ionic,
        zoom: 18,
        tilt: 30
      }

      // move the map's camera to position
      this.map.moveCamera(position)

      // create new marker
      let markerOptions: MarkerOptions = {
        position: ionic,
        title: 'Ionic'
      }

      this.map.addMarker(markerOptions).then((marker: Marker) => {
        console.log('first marker')
        this.delivery_position = marker
        this.location.backgroundTracking()
      })
    })

  }

  ngAfterViewInit() {
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

  addMarker(data){
    let ionic: LatLng = new LatLng(data.latitude, data.longitude)
    console.log('new position')
    console.log(ionic.toString())

    let position: CameraPosition = {
      target: ionic,
      zoom: 18,
      tilt: 30
    }
    this.map.moveCamera(position)

    let markerOptions: MarkerOptions = {
      position: ionic,
      title: 'current position'
    }

    console.log('addMarker')
    this.map.addMarker(markerOptions).then((marker: Marker) => {
        this.delivery_position = marker
        this.delivery_position.showInfoWindow()
        console.log('new marker')
      })
  }
}
