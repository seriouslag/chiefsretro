import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";

@Injectable()
export class RetroService {

  private _showCart = new BehaviorSubject<boolean>(false);
  showCart: Observable<boolean> = this._showCart.asObservable();

  constructor() {
    this.init();
  }

  private init(): void {
    let showCart = localStorage.getItem('showCart');
    if (showCart) {
      this._showCart.next(showCart == 'true')
    }
  }


  toggleCart() {
    this._showCart.next(!this._showCart.getValue());
    localStorage.setItem('showCart', this._showCart.getValue().toString())
  }

}
