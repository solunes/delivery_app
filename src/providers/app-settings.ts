import { Injectable } from '@angular/core';

@Injectable()
export class AppSettings {
  static api_url: string = 'http://delivery.solunes.com/api'
  static deliveries_key: string = 'deliveries'
  static endpoints = {
    home: '/check-location',
    auth: '-auth/authenticate',
    update_location: '/update-location/',
    delivery_status: '/delivery-status/'
  }
  static status_key: string = 'status'

  constructor() {}

  static updateLocation(lat, lng, acy): string{
    return this.endpoints.update_location + lat + '/' + lng + '/' + acy
  }

  static deliveryStatus(id_delivery, status, lat, lng){
    return this.endpoints.delivery_status + id_delivery + '/' + status + '/' + lat + '/' + lng
  }
}
