import { Component, ViewChild } from '@angular/core'
import { NavController, Slides } from 'ionic-angular'
import { Geoposition } from '@ionic-native/geolocation';
import { polyline } from '@mapbox/polyline';
import { Storage } from '@ionic/storage'
import {
 GoogleMaps,
 GoogleMap,
 GoogleMapsEvent,
 LatLng,
 CameraPosition,
 MarkerOptions,
 Marker,
 Polyline
} from '@ionic-native/google-maps'

import { LocationTracker } from '../../providers/location-tracker'
import { LoadingClient } from '../../providers/loading-client'
import { AuthService } from '../../providers/auth-service'
import { AppSettings } from '../../providers/app-settings'
import { HttpClient } from '../../providers/http-client'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild(Slides) slides: Slides;
  title_page = 'Home'
  map: GoogleMap
  delivery_position: Marker
  label: number = 0
  on_background: boolean
  deliveries: Array<JSON>

  constructor(public navCtrl: NavController,
    private location: LocationTracker,
    private storage: Storage,
    private http: HttpClient,
    private loading: LoadingClient, 
    private googleMaps: GoogleMaps) {

    

    this.storage.get(AppSettings.deliveries_key).then(value => {
      this.deliveries = value
      console.log(this.deliveries)
    })
    this.location.getResult().subscribe(data => {
      this.loading.dismiss()
      this.addMarker(data.latitude, data.longitude)
    })

    this.location.getCurrentObservable().subscribe((value:Geoposition) => {
      this.addMarker(value.coords.latitude, value.coords.longitude)
      //this.showWayRoutes(this.deliveries[0]['deliver'], this.deliveries[0]['pick'], this.polyline_route)
      //this.showWayRoutes(this.delivery_position.getPosition(), this.deliveries[0]['deliver'], this.polyline_user)
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
    this.location.getCurrentPosition()
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

  slideChanged(){
    console.log(this.slides.getActiveIndex())
    let delivery = this.deliveries[this.slides.getActiveIndex()]
    this.showWayRoutes(delivery['deliver'], delivery['pick'], this.polyline_route)
    this.showWayRoutes(this.delivery_position.getPosition(), this.deliveries[0]['deliver'], this.polyline_user)
  }

  showWayRoutes(origin, dest, polyline){
    let urlRequestWays = this.setDirections(origin, dest)
    console.log(urlRequestWays)
    this.http.getGoogleRequest(urlRequestWays).subscribe(result => {
      console.log('google api request')
      this.drawRoutes(result, polyline)
    }, error => console.log(error))
  }

  setDirections(origin, dest): string{
    let str_origin = "origin=" + origin.latitude + "," + origin.longitude
    let str_dest = "destination=" + dest.latitude + "," + dest.longitude
    let sensor = "sensor=false"
    let parameters = str_origin + "&" + str_dest + "&" + sensor
    return "https://maps.googleapis.com/maps/api/directions/json?" + parameters + "&mode=driving&key=AIzaSyDKr3c9K7ODEKPiXdy5d_-J4Wb1PUNulKo"
  }

  drawRoutes(result: JSON, polyline){
    let routes:Array<JSON> = result['routes']
    console.log(routes)
    let route_array:Array<JSON> = routes.shift()['legs'].shift()['steps']
    console.log(route_array)
    let points = []
    for (var i = 0; i < route_array.length; i++) {
      let start = route_array[i]['start_location']
      let end = route_array[i]['end_location']
      points.push(new LatLng(start['lat'], start['lng']))
      points.push(new LatLng(end['lat'], end['lng']))
    }
    polyline.remove()
    this.map.addPolyline({
      points: points,
      width: 2,
      geodesic: true,
      color: 'black'
    }).then((value:Polyline) => {
      polyline = value
    })
  }

  polyline_route: Polyline
  polyline_user: Polyline
}
