import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

@Injectable()
export class AppSettings {
  static api_url: string = 'http://delivery.solunes.com/api'
  static schedules_key: string = 'schedules'
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
