import {Injectable, NgZone} from "@angular/core";
import {User} from "../interfaces/user";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {Product} from "../interfaces/product";
import {CartItem} from "../interfaces/cart-item";
import {ProductOption} from "../interfaces/product-option";
import {MdDialogRef} from "@angular/material";
import {DialogService} from "./dialog.service";
import {CancelComponent} from "../components/dialogs/cancel/cancel.component";

@Injectable()
export class UserService {
  private _user = new BehaviorSubject<User>(this.createUser(null, '', 'Guest', '', null, null));
  private user = this._user.asObservable();

  private cartDialog: MdDialogRef<any>;

  getUser(): Observable<User> {
    return this.user;
  }

  updateUser(user: User): boolean {
    this.ngZone.run(() => {
      this._user.next(user);
      this.saveUserToLocalstorage();
    });
    return true;
  }

  private saveUserToLocalstorage() {
    let user = this._user.getValue();

    localStorage.setItem('user', JSON.stringify(user));
  }

  private getUserFromLocalStorage(): User {
    return JSON.parse(localStorage.getItem('user'));
  }

  addToCart(product: Product, productOption: ProductOption, quantity: number): boolean {
    let user = this._user.getValue();

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
      user.cartItems.push({
        product: product,
        productOption: productOption,
        quantity: quantity,
        dateAdded: Date.now()
      } as CartItem);
    }

    return this.updateUser(user);
  }

  removeFromCart(product: Product, productOption: ProductOption, quantity: number): boolean {
    let user = this._user.getValue();
    let index = 0;


    for (let cartItem of user.cartItems) {
      if (cartItem.product.productId == product.productId && cartItem.productOption.productOptionId == productOption.productOptionId) {
        if (cartItem.quantity == quantity) {
          this.cartDialog = this.dialogService.openDialog(CancelComponent, {});
          this.cartDialog.componentInstance.customText = "Remove from cart?";
          let result = false;
          let tempIndex = index;
          this.cartDialog.afterClosed().subscribe(cartResult => {
            //if the user wants to remove item then do so
            if (cartResult) {
              user.cartItems.splice(tempIndex, 1);
            }
            result = true;
          });
        } else {
          user.cartItems[index].quantity -= quantity;
        }
      }
      index++;
    }
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
    // this.ngZone.run(() => {

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
    // });
  }

  //use a promise so we can call init login after we check localstorahge,
  public init(): Promise<any> {
    let user = this.getUserFromLocalStorage();
    if (user) {
      this.updateUser(user);
    }
    return new Promise((resolve) => resolve(true));
  }

  constructor(private ngZone: NgZone, private dialogService: DialogService) {
  }

}
