import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Injectable()
export class NotificationService {

  private _notification = new BehaviorSubject<{ message: string, show: boolean }>({
    message: null,
    show: (sessionStorage.getItem('notification') != 'false')
  });
  public notification = this._notification.asObservable();

  constructor() {
  }

  public setMessage(message: string) {

    this._notification.next({message: message, show: (sessionStorage.getItem('notification') != 'false')});
    if ((sessionStorage.getItem('notification') != 'false')) {
      sessionStorage.setItem('notification', 'true');
    } else {
      sessionStorage.setItem('notification', 'false');
    }
  }

  public notify() {
    let currentState = this._notification.getValue();

    this._notification.next({message: currentState.message, show: true});
    sessionStorage.seItem('notification', 'true');
  }

  public toggle() {
    let currentState = this._notification.getValue();
    this._notification.next({message: currentState.message, show: !currentState.show});
    if (currentState) {
      sessionStorage.setItem('notification', 'false');
    } else {
      sessionStorage.seItem('notification', 'true');
    }
  }


}
