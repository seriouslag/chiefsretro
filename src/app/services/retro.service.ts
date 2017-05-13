import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";

@Injectable()
export class RetroService {

  private _showCart = new BehaviorSubject<boolean>(false);
  public showCart: Observable<boolean> = this._showCart.asObservable();

  private _showMobileSearch = new BehaviorSubject<Boolean>(false);
  public showMobileSearch: Observable<boolean> = this._showMobileSearch.asObservable();

  private _showDesktopNavbar = new BehaviorSubject<Boolean>(false);
  public showDesktopNavbar: Observable<boolean> = this._showDesktopNavbar.asObservable();

  constructor() {
    this.init();
  }

  private init(): void {
    let showCart = sessionStorage.getItem('showCart');
    let showMobileSearch = sessionStorage.getItem('showCart');
    let showDesktopNavbar = sessionStorage.getItem('navBar');

    if (showMobileSearch) {
      this._showMobileSearch.next(showMobileSearch == 'true');
    }

    if (showCart && location.pathname != '/checkout') {
      this._showCart.next(showCart == 'true');
    }

    if (showDesktopNavbar || showDesktopNavbar == null) {
      this._showDesktopNavbar.next(true);
    }
  }

  public toggleMobileSearch(): void {
    this._showMobileSearch.next(!this._showMobileSearch.getValue());
    sessionStorage.setItem('showMobileCart', this._showMobileSearch.getValue().toString());
  }

  public toggleCart(): void {
    this._showCart.next(!this._showCart.getValue());
    sessionStorage.setItem('showCart', this._showCart.getValue().toString());
  }

  public toggleDesktopNavbar(): void {
    this._showDesktopNavbar.next(!this._showDesktopNavbar.getValue());
    sessionStorage.setItem('navBar', this._showDesktopNavbar.getValue().toString())
  }

  public openCart(show: boolean): void {
    this._showCart.next(show);
    if (show) {
      sessionStorage.setItem('showCart', 'true');
    } else {
      sessionStorage.setItem('showCart', 'false');
    }
  }
}
