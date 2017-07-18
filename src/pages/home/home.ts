import { Component, ViewChild } from '@angular/core'
import { NavController, Slides } from 'ionic-angular'
import { Geoposition } from '@ionic-native/geolocation'
import { CallNumber } from '@ionic-native/call-number'
import { Diagnostic } from '@ionic-native/diagnostic'
import * as Poly from '@mapbox/polyline'
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

import { InitPage } from '../../pages/init/init'

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

  @ViewChild(Slides) slides: Slides
  title_page = 'Home'
  map: GoogleMap
  user_marker: Marker
  array_marker = new Array<Marker>()
  array_latLng = new Array<LatLng>()
  label: number = 0
  on_background: boolean = true
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
    private diagnostic: Diagnostic,
    private loading: LoadingClient, 
    private googleMaps: GoogleMaps) {

    this.location.backgroundGeolocation.isLocationEnabled().then(value => {
      console.log('is enabled')
      console.log(value)
    })

    this.location.getResult().subscribe(data => {
      console.log('get background result')
      // marker del usuario
      setTimeout(() => {
        this.addUserMarker(data.latitude, data.longitude, 'posicion actual')
        this.userWayRoute(new LatLng(data.latitude, data.longitude))
      },1000)
    })

    this.location.getCurrentObservable().subscribe((value:Geoposition) => {
      console.log('getCurrentObservable')
      this.array_latLng.push(new LatLng(value.coords.latitude, value.coords.longitude))
      this.drawRoutePickDeliver(this.deliveries[this.slides.getActiveIndex()])
      // marker del usuario
      this.addUserMarker(value.coords.latitude, value.coords.longitude, 'posicion actual')
      this.userWayRoute(new LatLng(value.coords.latitude,value.coords.longitude))
      this.fitBounds()
    })

    this.location.getDeliveres().subscribe(value => {
      console.log('respuesta de update location')
    })
  }

  ionViewWillEnter(){
    console.log('view init')
    this.loadMap()
  }

  loadMap(){
    
    let element = document.getElementById('map')
    this.map = new GoogleMap(element, {
      'controls': {
        'zoom': true
      }
    })

    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      console.log('Map is ready!')
        this.storage.get(AppSettings.deliveries_key).then(value => {
        this.deliveries = value
      })
      this.location.getCurrentPosition()
      this.location.backgroundTracking()
    })
  }

  addMarker(lat, lng, text, icon){
    console.log('add marker')
    let latLng: LatLng = new LatLng(lat, lng)
    let markerOptions: MarkerOptions = {
      position: latLng,
      icon: {
        url: 'www/assets/images/'+icon+'.png'
      },
      title: text
    }

    this.map.addMarker(markerOptions).then((marker: Marker) => {
        console.log('add marker')
        this.array_marker.push(marker)
      })
  }

  addUserMarker(lat, lng, text){
    console.log('add User Marker')
    let latLng: LatLng = new LatLng(lat, lng)

    let position: CameraPosition = {
      target: latLng,
      zoom: 17
    }
    let markerOptions: MarkerOptions = {
      position: latLng,
      icon: {
        url: 'www/assets/images/marker_moto.png'
      },
      title: text
    }

    this.map.moveCamera(position)
    if (!this.user_marker) {
      this.map.addMarker(markerOptions).then((marker: Marker) => {
          this.user_marker = marker
          this.user_marker.showInfoWindow()
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
    this.navCtrl.pop()
    this.array_marker.map(x => x.remove())
    this.map.clear()
    this.array_marker = []
    this.array_latLng = []
  }

  slideChanged(){
    if (this.slides.length() == this.slides.getActiveIndex()) {
      return
    }

    this.array_latLng = new Array<LatLng>()
    this.user_marker.getPosition().then(value => this.array_latLng.push(value))
    this.array_marker.map(value => value.remove())
    let delivery = this.deliveries[this.slides.getActiveIndex()]
    this.drawRoutePickDeliver(delivery)
    this.user_marker.getPosition().then(value => {
      this.userWayRoute(new LatLng(value.lat, value.lng))
      this.fitBounds()
    })
  }

  userWayRoute(data: LatLng){
    console.log('userWayRoute')
    let dest = this.deliveries[this.slides.getActiveIndex()]['pick']
    if (this.status_delivery == 2) {
      dest = this.deliveries[this.slides.getActiveIndex()]['deliver']
    }
    this.showWayRoutes(data, new LatLng(dest['latitude'], dest['longitude']) , true)
  }

  drawRoutePickDeliver(delivery){
    let pick = delivery['pick']
    let deliver = delivery['deliver']
    this.drawRouteDeliver(pick, deliver, 'marker_pick', 'marker_deliver')
  }

  // dibuja la ruta del pick al deliver
  drawRouteDeliver(ori, dst, ori_icon, dst_icon){
    console.log('drawRouteDeliver')
    this.array_latLng.push(new LatLng(ori.latitude, ori.longitude))
    this.array_latLng.push(new LatLng(dst.latitude, dst.longitude))
    this.showWayRoutes(new LatLng(ori.latitude, ori.longitude), new LatLng(dst.latitude, dst.longitude), false)
    // marker origen
    this.addMarker(ori.latitude, ori.longitude, ori.name, ori_icon)
    // marker destino
    this.addMarker(dst.latitude, dst.longitude, dst.name, dst_icon)
  }

  fitBounds(){
    let bounds = new LatLngBounds(this.array_latLng)
    this.map.setCenter(bounds.getCenter())
    let element = document.getElementById('map')
    let zoom = this.getBoundsZoomLevel(bounds, element.clientWidth, element.clientHeight)
    let position: AnimateCameraOptions = {
      target: bounds.getCenter(),
      zoom: zoom,
      duration: 1500
    }
    this.map.animateCamera(position)
  }

  // consulta a google por las rutas
  showWayRoutes(origin:LatLng, dest:LatLng, is_user:boolean){
    console.log('showWayRoutes')
    console.log(is_user)
    let urlRequestWays = this.setDirections(origin, dest)
    console.log(urlRequestWays)
    this.http.getGoogleRequest(urlRequestWays).subscribe(result => {
      console.log('google api request')
      this.drawRoutes(result, is_user)
    }, error => console.log(error))
  }

  // dibuja rutas
  drawRoutes(result: JSON, is_user:boolean){
    console.log('init draw routes')
    console.log(is_user)
    let routes:Array<JSON> = result['routes']
    let more_points = Poly.decode(routes.shift()['overview_polyline']['points'])

    let points = []
    for (var i = 0; i < more_points.length; i++) {
      let point = more_points[i]
      points.push(new LatLng(point[0], point[1]))
    }
    let color
    if (is_user) {
      color = 'red'
      if (this.polyline_user) {
        this.polyline_user.remove()
      }
    } else {
      color = 'blue'
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

  setDirections(origin:LatLng, dest:LatLng): string{
    let str_origin = "origin=" + origin.lat + "," + origin.lng
    let str_dest = "destination=" + dest.lat + "," + dest.lng
    let sensor = "sensor=false"
    let parameters = str_origin + "&" + str_dest + "&" + sensor
    return "https://maps.googleapis.com/maps/api/directions/json?" + parameters + "&mode=driving&key=AIzaSyDKr3c9K7ODEKPiXdy5d_-J4Wb1PUNulKo"
  }

  has_phone: boolean

  changeStatus(id_status){
    this.status_delivery = id_status
    this.user_marker.getPosition().then(value => {
      this.http.getRequest(AppSettings.deliveryStatus(this.deliveries[this.slides.getActiveIndex()]['id'], this.status_array[id_status], value.lat, value.lng)).subscribe(result => {
        this.clearArrayDeliveries(result['deliveries'])
        if (this.deliveries.length > 2) {
          this.status_delivery = 0
        } else {
          let delivery = this.deliveries[0]
          if (delivery['status'] == 'accepted') {
            if (delivery['pick']['phone']) {
              this.has_phone = true
            } else {
              this.has_phone = false
            }
            this.status_delivery = 1
            console.log('accepted')
          } else if (delivery['status'] == 'picked') {
            if (delivery['deliver']['phone']) {
              this.has_phone = true
            } else {
              this.has_phone = false
            }
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
    let phone
    if (this.status_delivery == 1) {
      phone = this.deliveries[this.slides.getActiveIndex()]['deliver']['phone']
    }
    if (this.status_delivery == 2) {
      phone = this.deliveries[this.slides.getActiveIndex()]['deliver']['phone']
    }
    this.callNumber.callNumber(phone, false).then(value => {
      console.log('llamando me')
    })

  }

  static LN2 = 0.6931471805599453
  static WORLD_PX_HEIGHT = 256
  static WORLD_PX_WIDTH = 256
  static ZOOM_MAX = 21

  getBoundsZoomLevel(bounds: LatLngBounds, mapWidthPx, mapHeightPx){
    let ne = bounds.northeast
    let sw = bounds.southwest

    let latFraction = (this.latRad(ne.lat) - this.latRad(sw.lat)) / Math.PI
    // console.log('latFraction')
    // console.log(latFraction)

    let lngDiff = ne.lng - sw.lng
    let lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360


    let latZoom = this.zoom(mapHeightPx, HomePage.WORLD_PX_HEIGHT, latFraction)
    // console.log('latZoom')
    // console.log(latZoom)
    let lngZoom = this.zoom(mapWidthPx, HomePage.WORLD_PX_WIDTH, lngFraction)
    // console.log('lngZoom')
    // console.log(lngZoom)

    let result = Math.min(latZoom, lngZoom)
    // console.log('result')
    // console.log(result)
    // console.log('end')
    // console.log(Math.min(result, HomePage.ZOOM_MAX))
    
    return Math.min(result, HomePage.ZOOM_MAX)
  }

  latRad(lat) {
    let sin = Math.sin(lat * Math.PI / 180)
    let radX2 = Math.log((1 + sin) / (1 - sin)) / 2
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2
  }
  zoom(mapPx, worldPx, fraction) {
      return Math.floor(Math.log(mapPx / worldPx / fraction) / HomePage.LN2)
  }
}

