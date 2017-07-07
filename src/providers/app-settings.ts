import { Injectable } from '@angular/core';

@Injectable()
export class AppSettings {
  static api_url: string = 'http://delivery.solunes.com/api'
  static deliveries_key: string = 'deliveries'
  static endpoints = {
    home: '/check-location',
    auth: '-auth/authenticate',
    update_location: '/update-location/'
  }
  static status_key: string = 'status'

  constructor() {}

  static updateLocation(lat, lng, acy): string{
    return this.endpoints.update_location + lat + '/' + lng + '/' + acy
  }
}
