import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";

@Injectable()
export class RetroService {

  private _showCart = new BehaviorSubject<boolean>(false);
  public showCart: Observable<boolean> = this._showCart.asObservable();

  private _showMobileSearch = new BehaviorSubject<Boolean>(false);
  public showMobileSearch: Observable<boolean> = this._showMobileSearch.asObservable();

  constructor() {
    this.init();
  }

  private init(): void {
    let showCart = localStorage.getItem('showCart');
    let showMobileSearch = localStorage.getItem('showCart');

    if (showMobileSearch) {
      this._showMobileSearch.next(showMobileSearch == 'true');
    }

    if (showCart) {
      this._showCart.next(showCart == 'true')
    }
  }

  public toggleMobileSearch(): void {
    this._showMobileSearch.next(!this._showMobileSearch.getValue());
    localStorage.setItem('showMobileCart', this._showMobileSearch.getValue().toString());
  }

  toggleCart() {
    this._showCart.next(!this._showCart.getValue());
    localStorage.setItem('showCart', this._showCart.getValue().toString());
  }

}
