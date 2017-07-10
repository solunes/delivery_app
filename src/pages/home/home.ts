import { Component, ViewChild } from '@angular/core'
import { NavController, Slides } from 'ionic-angular'
import { Geoposition } from '@ionic-native/geolocation';
import { CallNumber } from '@ionic-native/call-number';
import * as Poly from '@mapbox/polyline';
import { Storage } from '@ionic/storage'
import {
 GoogleMaps,
 GoogleMap,
 GoogleMapsEvent,
 LatLng,
 AnimateCameraOptions,
 CameraPosition,
 MarkerOptions,
 Marker,
 LatLngBounds,
 Polyline, Polygon
} from '@ionic-native/google-maps'

import { Observable, Subscription, Subject } from 'rxjs/Rx'

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
  user_marker: Marker
  array_marker = new Array<Marker>()
  array_latLng = new Array<LatLng>()
  label: number = 0
  on_background: boolean
  deliveries: Array<JSON>
  polyline_route: Polyline
  polyline_user: Polyline
  status_delivery: number = 0
  status_array = ['accepted', 'picked','delivered', 'cancelled']

  constructor(public navCtrl: NavController,
    private location: LocationTracker,
    private storage: Storage,
    private callNumber: CallNumber,
    private http: HttpClient,
    private loading: LoadingClient, 
    private googleMaps: GoogleMaps) {

    this.storage.get(AppSettings.deliveries_key).then(value => {
      this.deliveries = value
      console.log(this.deliveries)
    })

    this.location.getResult().subscribe(data => {
      this.loading.dismiss()
      this.addUserMarker(data.latitude, data.longitude, 'posicion actual')
      this.showWayRoutes(data, this.deliveries[this.slides.getActiveIndex()], true)
    })

    this.location.getCurrentObservable().subscribe((value:Geoposition) => {
      console.log('getCurrentObservable')
      this.array_latLng.push(new LatLng(value.coords.latitude, value.coords.longitude))
      this.addUserMarker(value.coords.latitude, value.coords.longitude, 'posicion actual')
      this.drawRouteDeliver(this.deliveries[0])
      this.fitBounds()
    })

    this.location.getDeliveres().subscribe(value => {
      this.deliveries = value['deliveries']
      this.slides.update()
      this.storage.set(AppSettings.deliveries_key, value['deliveries'])
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
    this.map = this.googleMaps.create(element, {
      'controls': {
        'zoom': true
      }
    })

    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      console.log('Map is ready!')
      this.location.getCurrentPosition()
    })
  }

  addMarker(lat, lng, text){
    let latLng: LatLng = new LatLng(lat, lng)
    let markerOptions: MarkerOptions = {
      position: latLng,
      title: text
    }

    this.map.addMarker(markerOptions).then((marker: Marker) => {
        console.log('add marker')
        this.array_marker.push(marker)
      })
  }

  addUserMarker(lat, lng, text){
    let latLng: LatLng = new LatLng(lat, lng)

    let position: CameraPosition = {
      target: latLng,
      zoom: 17,
      tilt: 30
    }
    let markerOptions: MarkerOptions = {
      position: latLng,
      title: text
    }

    this.map.moveCamera(position)
    if (!this.user_marker) {
      this.map.addMarker(markerOptions).then((marker: Marker) => {
          this.user_marker = marker
          this.user_marker.showInfoWindow()
          this.user_marker.getPosition().then(value => {
            this.showWayRoutes({latitude:value.lat, longitude:value.lng}, this.deliveries[0]['pick'], true)
            this.array_latLng.push(value)
          })
        })
    } else {
      this.label++
      this.user_marker.setTitle(this.label.toString())
      this.user_marker.showInfoWindow()
      this.user_marker.setPosition(latLng)
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
    if (this.slides.length() == this.slides.getActiveIndex()) {
      return
    }

    this.array_latLng = new Array<LatLng>()
    this.user_marker.getPosition().then(value => this.array_latLng.push(value))
    console.log(this.slides.getActiveIndex())
    this.array_marker.map(value => value.remove())
    console.log('remove')
    let delivery = this.deliveries[this.slides.getActiveIndex()]
    this.drawRouteDeliver(delivery)
    this.user_marker.getPosition().then(value => {
      this.showWayRoutes({latitude:value.lat, longitude:value.lng}, delivery['pick'], true)
      this.fitBounds()
    })
  }

  fitBounds(){
    let bounds = new LatLngBounds(this.array_latLng)
    this.map.setCenter(bounds.getCenter())
    let position: AnimateCameraOptions = {
      target: bounds.getCenter(),
      zoom: 14,
      duration: 1500
    }
    this.map.animateCamera(position)
  }

  drawRouteDeliver(delivery){
    let pick = delivery['pick']
    let deliver = delivery['deliver']
    this.array_latLng.push(new LatLng(deliver.latitude, deliver.longitude))
    this.array_latLng.push(new LatLng(pick.latitude, pick.longitude))
    this.fitBounds()
    this.showWayRoutes(pick, deliver, false)
    this.addMarker(deliver.latitude, deliver.longitude, deliver.name)
    this.addMarker(pick.latitude, pick.longitude, pick.name)
  }

  showWayRoutes(origin, dest, is_user:boolean){
    let urlRequestWays = this.setDirections(origin, dest)
    console.log(urlRequestWays)
    this.http.getGoogleRequest(urlRequestWays).subscribe(result => {
      console.log('google api request')
      this.drawRoutes(result, is_user)
    }, error => console.log(error))
  }

  drawRoutes(result: JSON, is_user:boolean){
    console.log('init draw routes')
    let routes:Array<JSON> = result['routes']
    let more_points = Poly.decode(routes.shift()['overview_polyline']['points'])

    let points = []
    for (var i = 0; i < more_points.length; i++) {
      let point = more_points[i]
      points.push(new LatLng(point[0], point[1]))
    }
    let color
    if (is_user) {
      color = 'blue'
      if (this.polyline_user) {
        this.polyline_user.remove()
      }
    } else {
      color = 'red'
      if (this.polyline_route) {
        this.polyline_route.remove()
      }
    }
    this.map.addPolyline({
      points: points,
      width: 2,
      geodesic: true,
      color: color
    }).then((value:Polyline) => {
      if (is_user) {
        this.polyline_user = value
      } else {
        this.polyline_route = value
      }
    })
    console.log('end draw routes')
  }

  setDirections(origin, dest): string{
    let str_origin = "origin=" + origin.latitude + "," + origin.longitude
    let str_dest = "destination=" + dest.latitude + "," + dest.longitude
    let sensor = "sensor=false"
    let parameters = str_origin + "&" + str_dest + "&" + sensor
    return "https://maps.googleapis.com/maps/api/directions/json?" + parameters + "&mode=driving&key=AIzaSyDKr3c9K7ODEKPiXdy5d_-J4Wb1PUNulKo"
  }

  changeStatus(id_status){
    this.status_delivery = id_status
    this.user_marker.getPosition().then(value => {
      this.http.getRequest(AppSettings.deliveryStatus(this.deliveries[this.slides.getActiveIndex()]['id'], this.status_array[id_status], value.lat, value.lng)).subscribe(result => {
        console.log(JSON.stringify(result['deliveries'].length))
        this.clearArrayDeliveries(result['deliveries'])
        if (this.deliveries.length > 2) {
          this.status_delivery = 0
        } else {
          let delivery = this.deliveries[0]
          if (delivery['status'] == 'accepted') {
            this.status_delivery = 1
            console.log('accepted')
          } else if (delivery['status'] == 'picked') {
            this.status_delivery = 2
            console.log('picked')
          } else {
            console.log('error')
          }
        }
      }, error => console.log(error))
    })
  }

  cancelDelivery(){
    this.user_marker.getPosition().then(value => {
      this.http.getRequest(AppSettings.deliveryStatus(this.deliveries[this.slides.getActiveIndex()]['id'], this.status_array[3], value.lat, value.lng)).subscribe(result => {
        console.log('cancelDelivery')
        console.log(JSON.stringify(result))
        this.status_delivery = 0
        this.clearArrayDeliveries(result['deliveries'])
      }, error => console.log(error))
    })
  }

  clearArrayDeliveries(result_deliveries){
    this.deliveries = new Array<JSON>()
    console.log('update')
    this.slides.update()
    for (var i = 0; i < result_deliveries.length; i++) {
      this.deliveries.push(result_deliveries[i])
    }
    console.log('slide to')
    this.slides.slideTo(0)
    this.slideChanged()
  }

  call_number(){
    this.callNumber.callNumber('72008625', true).then(value => {
      console.log('llamando me')
    })
  }
}

