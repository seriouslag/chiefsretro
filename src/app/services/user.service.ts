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
import {AngularFireDatabase, FirebaseObjectObservable} from "angularfire2/database";
import {DbCartItem} from "../interfaces/db-cart-item";

@Injectable()
export class UserService {
  private _user = new BehaviorSubject<User>(null);
  public user = this._user.asObservable();

  private cartDialog: MdDialogRef<any>;
  private toastLength = 1500;

  _waitingForUpdate = new BehaviorSubject<boolean>(false);

  private item: FirebaseObjectObservable<any>;

  constructor(private ngZone: NgZone, private dialogService: DialogService, private toastService: ToastService, private db: AngularFireDatabase) {
  }

  updateUser(user: User): boolean {
    console.log('updating user');
    this.ngZone.run(() => {
      let index = 0;

      //if cartItem quantity is zero them remove


      let dbCart: DbCartItem[] = [];
      console.log(user);

      for (let cartItem of user.cartItems) {
        if (cartItem.quantity == 0) {
          user.cartItems.splice(index, 1);
        } else {

          //DB prep dont do for guest
          if (user.fname !== "Guest") {
            let dbCartItem: DbCartItem = {
              productId: cartItem.product.productId,
              productOptionId: cartItem.productOption.productOptionId,
              quantity: cartItem.quantity,
              dateAdded: cartItem.dateAdded
            };

            dbCart.push(dbCartItem);
          }
        }
      }

      //dont do DB stuff for guest
      if (user.fname !== "Guest") {
        //DATABASE
        this.item = this.db.object('/users/' + user.id);

        this.item.update({
          name: user.fname + " " + user.lname,
          email: user.email,
          cartItems: dbCart
          //photo: user.img
        });

      } else {
        this.saveUserToLocalstorage();
      }


      this._user.next(user);






    });
    return true;
  }

  public logout() {
    //this.db.database.goOffline();

    this.item = null;
  }

  public setUser(user: User): void {
    this._user.next(user);
  }

  public saveUserToLocalstorage() {
    let user = this._user.getValue();

    localStorage.setItem('user', JSON.stringify(user));
  }

  public getUserFromLocalStorage(): User {
    return JSON.parse(localStorage.getItem('user'));
  }

  addToCart(product: Product, productOption: ProductOption, quantity: number): boolean {
    if (this._waitingForUpdate.getValue() == false) {
      let user = this._user.getValue();

      let index = 0;
      let cartContainedItem = false;
      if (user.cartItems.length) {
        if (user.cartItems[user.cartItems.length - 1].productOption) {
          for (let cartItem of user.cartItems) {
            if (cartItem.productOption.productOptionId == productOption.productOptionId) {
              this.toast('Added ' + quantity + ' ' + productOption.productColor + ' ' + product.productName + ' To Cart');
              user.cartItems[index].quantity += quantity;
              cartContainedItem = true;
              break;
            }
            index++;
          }
        }
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
    return false;
  }

  removeFromCart(product: Product, productOption: ProductOption, quantity: number): boolean {
    if (this._waitingForUpdate.getValue() == false) {
      let user = this._user.getValue();
      let index = 0;

      for (let cartItem of user.cartItems) {
        if (cartItem.product && cartItem.productOption) {
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
        }
        index++;
      }
      return this.updateUser(user);
    }
    return false;
  }

  public userToGuest() {
    let guest: User;
    guest = {
      fname: "Guest",
      lname: null,
      id: null,
      email: null,
      cartItems: [],
    };
    this._user.next(guest);
  }


  private toast(message: string): void {
    this.toastService.toast(message, 'OK', this.toastLength);
  }

  //use a promise so we can call init login after we check localstorage,
  public init(): Promise<any> {

    return new Promise((resolve) => resolve(true));
  }

  private createUser(id: number, email: string, fname: string,
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

}
