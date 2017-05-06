import {Injectable, NgZone} from "@angular/core";
import {User} from "../interfaces/user";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {Product} from "../interfaces/product";
import {CartItem} from "../interfaces/cart-item";
import {ProductOption} from "../interfaces/product-option";
import {isUndefined} from "util";

@Injectable()
export class UserService {
  private _user = new BehaviorSubject<User>(this.createUser(null, '', 'Guest', '', null, null));
  private user = this._user.asObservable();

  getUser(): Observable<User> {
    return this.user;
  }

  updateUser(user: User): Boolean {
    this._user.next(user);
    return true;
  }

  addToCart(product: Product, productOption: ProductOption, quantity: number): Boolean {
    let user = this._user.getValue();
    let cartItem: CartItem = <CartItem>{
      product: product,
      productOption: productOption,
      quantity: quantity,
      dateAdded: Date.now()
    };

    //should be safe to remove this if
    if (isUndefined(user.cartItems.length)) {
      user.cartItems = [];
    }
    let index = 0;
    let cartContainedItem = false;
    for (let cartItem of user.cartItems) {
      if (cartItem.productOption.productOptionId == productOption.productOptionId) {
        user.cartItems[index].quantity += quantity;
        cartContainedItem = true;
      }
      index++;
    }
    if (cartContainedItem == false) {
      user.cartItems.push(cartItem as CartItem);
    }

    //if the cart already has a productOption of the same idea add the quantities else add the item
    /*if(user.cartItems[productOption.productOptionId]) {
     user.cartItems[productOption.productOptionId].quantity += quantity;
     } else {
     user.cartItems[productOption.productOptionId] = cartItem as CartItem;
     }*/
    return this.updateUser(user);
  }

  createUser(id: number = null, email: string, fname: string,
             lname: string, femail: string = null, gemail: string = null, google?: any, fb?: any, img?: string) {
    let user: User = <User>{
      id: id,
      email: email,
      fname: fname,
      lname: lname,
      femail: femail,
      gemail: gemail,
      google: null,
      fb: null,
      img: null,
      cartItems: [] as CartItem[]
    };

    return user;
  }

  createUserFromUser(user: User) {
    let newUser: User = <User>{
      id: user.id,
      email: user.email,
      fname: user.fname,
      lname: user.lname,
      femail: user.femail,
      gemail: user.gemail,
      google: user.google,
      fb: user.fb,
      img: user.img,
      cartItems: user.cartItems
    };
    return newUser;
  }

  resetUser(): void {
    /*
     TODO test ngzone to see if it is needed
     */
    this.ngZone.run(() => {

      this.updateUser(this.createUserFromUser(
        <User>{
          id: null,
          email: null,
          fname: "Guest",
          lname: "",
          femail: null,
          gemail: null,
          cartItems: [] as CartItem[]
        }
      ));
    });
  }

  constructor(private ngZone: NgZone) {
  }

}
