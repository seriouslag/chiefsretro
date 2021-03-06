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

  private _showAdmin = new BehaviorSubject<Boolean>(false);
  public showAdmin: Observable<boolean> = this._showAdmin.asObservable();

  constructor() {
    this.init();
  }

  private init(): void {
    const showCart = sessionStorage.getItem('showCart');
    const showMobileSearch = sessionStorage.getItem('showCart');
    const showDesktopNavbar = sessionStorage.getItem('navBar');

    if (showMobileSearch) {
      this._showMobileSearch.next(showMobileSearch === 'true');
    }

    if (showCart && location.pathname !== '/checkout') {
      this._showCart.next(showCart === 'true');
    }

    if (showDesktopNavbar || showDesktopNavbar == null) {
      this._showDesktopNavbar.next(true);
    }
  }

  public toggleMobileSearch(): void {
    this._showMobileSearch.next(!this._showMobileSearch.getValue());
    sessionStorage.setItem('showMobileCart', this._showMobileSearch.getValue().toString());
  }

  public toggleAdmin(): void {
    this._showAdmin.next(!this._showAdmin.getValue());
    sessionStorage.setItem('showAdmin', this._showAdmin.getValue().toString());
  }

  public setAdmin(show: boolean): void {
    this._showAdmin.next(show);
    sessionStorage.setItem('showAdmin', show.toString())
  }

  public toggleCart(): void {
    if (location.pathname === '/checkout') {
      this.openCart(false);
    } else {
      this._showCart.next(!this._showCart.getValue());
      if (this._showCart.getValue()) {
        sessionStorage.setItem('showCart', 'true');
      } else {
        sessionStorage.setItem('showCart', 'false');
      }
    }
  }

  public toggleDesktopNavbar(): void {
    this._showDesktopNavbar.next(!this._showDesktopNavbar.getValue());
    sessionStorage.setItem('navBar', this._showDesktopNavbar.getValue().toString())
  }

  public openCart(show: boolean): void {
    if (location.pathname === '/checkout') {
      show = false;
    }
    this._showCart.next(show);
    if (show) {
      sessionStorage.setItem('showCart', 'true');
    } else {
      sessionStorage.setItem('showCart', 'false');
    }
  }
}
