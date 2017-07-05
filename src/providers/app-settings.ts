import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

@Injectable()
export class AppSettings {
  static api_url: string = 'http://asistencia.solunes.com/api'
  static schedules_key: string = 'schedules'
  static endpoints = {
    home: '/check-location',
    auth: '-auth/authenticate',
  }
  static status_key: string = 'status'

  constructor() {}

  static checkLocation(user_id, action, lat, lng, accuracy, uuid=''): string{
    let ibeacon_query = ''
    if (uuid) {
       ibeacon_query = '/' + uuid
    }
    return '/check-location/' + user_id + '/' + action + '/' + lat + '/' + lng + '/' + accuracy + ibeacon_query
  }
}
