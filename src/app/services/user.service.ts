import {Injectable, NgZone} from "@angular/core";
import {User} from "../interfaces/user";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Product} from "../interfaces/product";
import {CartItem} from "../interfaces/cart-item";
import {ProductOption} from "../interfaces/product-option";
import {MdDialogRef} from "@angular/material";
import {DialogService} from "./dialog.service";
import {CancelComponent} from "../components/dialogs/cancel/cancel.component";
import {ToastService} from "./toast.service";
import {AngularFireAuth} from "angularfire2/auth";

@Injectable()
export class UserService {
  private _user = new BehaviorSubject<User>(null);
  public user = this._user.asObservable();

  private cartDialog: MdDialogRef<any>;
  private toastLength = 1500;

  updateUser(user: User): boolean {
    this.ngZone.run(() => {
      let index = 0;

      //if cartItem quantity is zero them remove
      for (let cartItem of user.cartItems) {
        if (cartItem.quantity == 0) {
          user.cartItems.splice(index, 1);
        }
      }


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
        this.toast('Added ' + quantity + ' ' + productOption.productColor + ' ' + product.productName + ' To Cart');
        user.cartItems[index].quantity += quantity;
        cartContainedItem = true;
        break;
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
      this.toast('Added ' + quantity + ' ' + productOption.productColor + ' ' + product.productName + ' To Cart');
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


          //this does not pause the function;
          //the subscription is async so the function will return before the user
          //can click a result. the subscription must call update user;
          this.cartDialog.afterClosed().subscribe(cartResult => {
            //if the user wants to remove item then do so
            if (cartResult) {
              user.cartItems.splice(tempIndex, 1);
              this.updateUser(user);
              this.toast('Removed ' + quantity + ' ' + productOption.productColor + ' ' + product.productName + ' From Cart');
            }
            result = true;
          });
        } else {
          user.cartItems[index].quantity -= quantity;
          this.toast('Removed ' + quantity + ' ' + user.cartItems[index].productOption.productColor + ' ' + user.cartItems[index].product.productName + ' From Cart');
        }
      }
      index++;
    }
    return this.updateUser(user);
  }

  createUser(id: number = null, email: string, fname: string,
             lname: string, femail: string = null, gemail: string = null, google?: any, firebase?: any, fb?: any, img?: string): User {

    return {
      id: id,
      email: email,
      fname: fname,
      lname: lname,
      femail: femail,
      gemail: gemail,
      google: google,
      firebase: firebase,
      fb: fb,
      img: img,
      cartItems: [] as CartItem[]
    } as User;
  }

  createUserFromUser(user: User): User {
    return {
      id: user.id,
      email: user.email,
      fname: user.fname,
      lname: user.lname,
      femail: user.femail,
      gemail: user.gemail,
      google: user.google,
      fb: user.fb,
      firebase: user.firebase,
      img: user.img,
      cartItems: user.cartItems
    } as User;
  }

  resetUser(): void {
    this.updateUser(this.createUser(null, null, null, null, null));
  }

  private toast(message: string): void {
    this.toastService.toast(message, 'OK', this.toastLength);
  }

  //use a promise so we can call init login after we check localstorage,
  public init(): Promise<any> {
    let user = this.getUserFromLocalStorage();
    if (user) {
      this.updateUser(user);
    }
    return new Promise((resolve) => resolve(true));
  }

  constructor(private ngZone: NgZone, private dialogService: DialogService, private toastService: ToastService, private afAuth: AngularFireAuth) {
  }

}
