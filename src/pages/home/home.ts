import { Component, ViewChild } from '@angular/core'
import { NavController, Slides } from 'ionic-angular'
import { Geoposition } from '@ionic-native/geolocation';
import * as Poly from '@mapbox/polyline';
import { Storage } from '@ionic/storage'
import {
 GoogleMaps,
 GoogleMap,
 GoogleMapsEvent,
 LatLng,
 CameraPosition,
 MarkerOptions,
 Marker,
 Polyline, Polygon as poll
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
  polyline_route: Polyline
  polyline_user: Polyline

  constructor(public navCtrl: NavController,
    private location: LocationTracker,
    private storage: Storage,
    private http: HttpClient,
    private loading: LoadingClient, 
    private googleMaps: GoogleMaps) {

    console.log(Poly.decode('h}|cBvon~KdBAdC?fDJF?F?R?PALC'))

    this.storage.get(AppSettings.deliveries_key).then(value => {
      this.deliveries = value
      console.log(this.deliveries)
    })

    this.location.getResult().subscribe(data => {
      this.loading.dismiss()
      this.addMarker(data.latitude, data.longitude)
    })

    this.location.getCurrentObservable().subscribe((value:Geoposition) => {
      console.log('getCurrentObservable')
      console.log(this.delivery_position)
      this.addMarker(value.coords.latitude, value.coords.longitude)
      this.showWayRoutes(this.deliveries[0]['deliver'], this.deliveries[0]['pick'], false)
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

  addMarker(lat, lng){
    let latLng: LatLng = new LatLng(lat, lng)

    let position: CameraPosition = {
      target: latLng,
      zoom: 14,
      tilt: 30
    }
    let markerOptions: MarkerOptions = {
      position: latLng,
      title: 'position actual'
    }

    this.map.moveCamera(position)
    if (!this.delivery_position) {
      this.map.addMarker(markerOptions).then((marker: Marker) => {
          this.delivery_position = marker
          this.delivery_position.showInfoWindow()
          this.delivery_position.getPosition().then(value => {
            this.showWayRoutes({latitude:value.lat, longitude:value.lng}, this.deliveries[0]['deliver'], true)
          })
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
    this.showWayRoutes(delivery['deliver'], delivery['pick'], false)
    this.delivery_position.getPosition().then(value => {
      this.showWayRoutes({latitude:value.lat, longitude:value.lng}, delivery['deliver'], true)
    })
  }

  showWayRoutes(origin, dest, is_user:boolean){
    let urlRequestWays = this.setDirections(origin, dest)
    console.log(urlRequestWays)
    this.http.getGoogleRequest(urlRequestWays).subscribe(result => {
      console.log('google api request')
      this.drawRoutes(result, is_user)
    }, error => console.log(error))
  }

  //drawRoutes(result: JSON, is_user:boolean){
  //  console.log('init draw routes')
  //  let routes:Array<JSON> = result['routes']
  //  let route_array:Array<JSON> = routes.shift()['legs'].shift()['steps']
  //  let points = []
  //  for (var i = 0; i < route_array.length; i++) {
  //    let start = route_array[i]['start_location']
  //    let end = route_array[i]['end_location']
  //    points.push(new LatLng(start['lat'], start['lng']))
  //    points.push(new LatLng(end['lat'], end['lng']))
  //  }
  //  let color
  //  if (is_user) {
  //    color = 'blue'
  //    if (this.polyline_user) {
  //      this.polyline_user.remove()
  //    }
  //  } else {
  //    color = 'red'
  //    if (this.polyline_route) {
  //      this.polyline_route.remove()
  //    }
  //  }
  //  this.map.addPolyline({
  //    points: points,
  //    width: 2,
  //    geodesic: true,
  //    color: color
  //  }).then((value:Polyline) => {
  //    if (is_user) {
  //      this.polyline_user = value
  //    } else {
  //      this.polyline_route = value
  //    }
  //  })
  //  console.log('end draw routes')
  //}

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
}
