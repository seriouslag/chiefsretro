import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";

@Injectable()
export class RetroService {

  private showCart = new BehaviorSubject<boolean>(false);
  _showCart: Observable<boolean> = this.showCart.asObservable();

  constructor() {
  }


  toggleCart() {
    this.showCart.next(!this.showCart.getValue());
  }

}
