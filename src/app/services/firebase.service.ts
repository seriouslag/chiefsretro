import {Injectable} from "@angular/core";
import {AngularFireDatabase, FirebaseListObservable} from "angularfire2/database";
import {AngularFireAuth} from "angularfire2/auth";
import {ToastService} from "./toast.service";
import * as firebase from "firebase/app";
import {User} from "firebase/app";
import {Subscription} from "rxjs/Subscription";
import {MdDialogConfig, MdDialogRef} from "@angular/material";
import {LoginComponent} from "../components/dialogs/login/login.component";
import {DialogService} from "./dialog.service";
import {LogoutComponent} from "../components/dialogs/logout/logout.component";
import {CartItem} from "../interfaces/cart-item";
import {DbCartItem} from "../interfaces/db-cart-item";
import {Product} from "../interfaces/product";
import {ProductOption} from "../interfaces/product-option";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {CancelComponent} from "../components/dialogs/cancel/cancel.component";

@Injectable()
export class FirebaseService {

  private loggedInSubscription: Subscription;
  private productsSubscription: Subscription;

  public _signedIn = new BehaviorSubject<boolean>(false);
  public signedIn = this._signedIn.asObservable();

  public _user = new BehaviorSubject<User>(null);
  public user = this._user.asObservable();
  public dbcart: DbCartItem[];
  public _dbcart: FirebaseListObservable<any>;
  public _cart = new BehaviorSubject<CartItem[]>([]);
  public cart = this._cart.asObservable();
  private cartDialog: MdDialogRef<any>;

  private loginDialog: MdDialogRef<LoginComponent>;

  public products: Product[];

  constructor(private af: AngularFireAuth, private db: AngularFireDatabase, private toastService: ToastService, private dialogService: DialogService) {

    this.productsSubscription = this.db.list('products/')
      .subscribe((products: Product[]) => {
        this.products = products;
        this.init();
      });
  }

  private init(): void {
    this.loggedInSubscription = this.af.authState.subscribe(user => {

      let cartItems = [];

      this._user.next(user);

      if (user == null) {
        sessionStorage.setItem('login', 'false');
        //not logged in
        if (this._signedIn.getValue()) {
          //if was logged in then show logout message
          this.showLogout();
        } else {
          //check localstorage for cartitems then assign them to cartItems

        }
        this._signedIn.next(false);

      } else {
        //logged in
        if (sessionStorage.getItem('login') == 'true') {
          this.silentLogin();
        } else {
          this.showLogin();
        }

        sessionStorage.setItem('login', 'true');

        this._signedIn.next(true);
        this._user.next(user);

        //connect cart to database
        this._dbcart = this.db.list('users/' + this._user.getValue().uid + "/cartItems/");
        this._dbcart.subscribe((dbcart: DbCartItem[]) => {
          this.dbcart = dbcart;
          let cart: CartItem[] = [];
          for (let dbCartItem of dbcart) {
            let cartItem: CartItem = {
              product: this.getProductByProductId(dbCartItem.productId),
              productOption: this.getProductOptionByProductOptionId(dbCartItem.productOptionId),
              quantity: dbCartItem.quantity,
              dateAdded: dbCartItem.dateAdded
            };
            cart.push(cartItem)
          }

          this._cart.next(cart);
        });
      }
    });
  }

  public getProductByProductId(id: number): Product {
    for (let product of this.products) {
      if (product.productId == id) {
        return product;
      }
    }
    return null;
  }

  public getProductOptionByProductOptionId(id: number): ProductOption {
    for (let product of this.products) {
      for (let productOption of product.productOptions) {
        if (productOption.productOptionId == id) {
          return productOption;
        }
      }
    }
    return null;
  }

  public addProductToCart(product: Product, productOption: ProductOption, quantity: number, dateAdded: number) {
    if (this._user.getValue()) {

      let tempCart: DbCartItem[] = this.dbcart;

      let i = 0;
      let check = true;

      for (let cartItem of tempCart) {
        if (cartItem.productOptionId == productOption.productOptionId) {

          tempCart[i].quantity += quantity;
          this.db.object('users/' + this._user.getValue().uid + "/cartItems/" + cartItem.productOptionId).set(tempCart[i]);
          check = false;
          break;
        }
        i++;
      }
      if (check) {

        let dbCartItem: DbCartItem = {
          productId: product.productId,
          productOptionId: productOption.productOptionId,
          quantity: quantity,
          dateAdded: dateAdded
        };
        //tempCart.push(dbCartItem);
        this.db.object('users/' + this._user.getValue().uid + '/cartItems/' + productOption.productOptionId).set(dbCartItem)
      }
    } else {
      //guest add to cart
    }
    this.toast('Added ' + quantity + ' ' + productOption.productColor + ' ' + product.productName + ' To Cart');
  }

  public removeProductFromCart(product: Product, productOption: ProductOption, quantity: number) {
    if (this._user.getValue()) {
      let tempCart = this.dbcart;

      let i = 0;
      for (let cartItem of tempCart) {
        if (cartItem.productOptionId == productOption.productOptionId) {
          tempCart[i].quantity -= product.productId;
          if (tempCart[i].quantity <= 0) {
            this.cartDialog = this.dialogService.openDialog(CancelComponent, {});
            this.cartDialog.componentInstance.customText = "Remove from cart?";
            let result = false;

            this.cartDialog.afterClosed().subscribe(cartResult => {
              //if the user wants to remove item then do so
              if (cartResult) {
                this.db.object('users/' + this._user.getValue().uid + "/cartItems/" + productOption.productOptionId).remove();
                this.toast('Removed ' + quantity + ' ' + productOption.productColor + ' ' + product.productName + ' From Cart');
              }
              result = true;
            });
          } else {
            this.db.object('users/' + this._user.getValue().uid + "/cartItems/" + productOption.productOptionId).set(tempCart[i]);
            this.toast('Removed ' + quantity + ' ' + productOption.productColor + ' ' + product.productName + ' From Cart');
            break;
          }
        }
        i++;
      }
    } else {
      //guest remove from cart

    }
  }

  public changeLoginStatus(boolean) {
    if (boolean) {
      this.loginDialog = this.dialogService.openDialog(LoginComponent, new MdDialogConfig());
      this.loginDialog.componentInstance.showLoginText = true;
      this.loginDialog.componentInstance.firebaseService = this;
      this.loginDialog.afterClosed().subscribe(loginResult => {
        setTimeout(() => {
          if (this._signedIn.getValue() == false) {
            if (loginResult == 'force') {
              //do nothing
            } else if (loginResult == 'firebase') {
              //handled elsewhere to avoid popup blocker
            } else {
              this.loginCanceled();
            }
          }
        }, 150);
      });
    } else {
      //do log out;
      let logoutDialog = this.dialogService.openDialog(LogoutComponent, new MdDialogConfig());
      logoutDialog.afterClosed().subscribe(logoutResult => {
        if (logoutResult) {

          //disconnect from db before signing out
          if (this._dbcart) {
            this._dbcart.$ref.off();
          }
          this.af.auth.signOut();
        } else {
          //canceled logout
        }
      });
    }
  }

  private firebaseLogin(provider: any) {
    this.af.auth.signInWithPopup(provider).then((result) => {
      //have event handler to handle this
    }).catch((error: any) => {
      this.showLoginFailed();
      let errorCode = error.code;
      let errorMessage = error.message;
      // The email of the user's account used.
      let email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      let credential = error.credential;
      // [START_EXCLUDE]
      if (errorCode === 'auth/account-exists-with-different-credential') {
        alert('You have already signed up with a different auth provider for that email.');
        // If you are using multiple auth providers on your app you should handle linking
        // the user's accounts here.
      } else if (errorCode === 'auth/network-request-failed') {
        this.toast("Cannot connect to Google's services right now.");
      } else {
        console.error(error);
      }
    });
  }

  public firebaseCreateUserFromEmail(email: string, password: string): Promise<string> {
    let message = new Promise((resolve, reject) => {
      this.af.auth.createUserWithEmailAndPassword(email, password).then((response) => {
        resolve('ok');
      }).catch((error: any) => {
        let errorCode = error.code;
        let errorMessage = error.message;
        this.toast(errorMessage);
        if (errorCode == 'auth/weak-password') {
        } else if (errorCode == 'auth/invalid-email') {
        } else if (errorCode == 'auth/email-already-in-use') {
        } else if (errorCode == 'auth/operation-not-allowed') {
        } else {
          console.log('An unknow error occured', error);
        }
        resolve(errorCode);
      })
    });
    return message;
  }

  public firebaseEmailLogin(email: string, password: string): Promise<string> {
    let message = new Promise((resolve => {
      this.af.auth.signInWithEmailAndPassword(email, password).then(reponse => {
        resolve('ok');
      }).catch((error: any) => {
        let errorCode = error.code;
        let errorMessage = error.message;
        this.toast(errorMessage);
        if (errorCode == 'auth/user-disabled') {
        } else if (errorCode == 'auth/invalid-email') {
        } else if (errorCode == 'auth/user-not-found') {
        } else if (errorCode == 'auth/wrong-password') {
        } else {
          console.log('An unknow error occured', error);
        }
        resolve(errorCode);
      });
    }));
    return message;
  }

  public firebaseFacebookLogin() {
    let provider = new firebase.auth.FacebookAuthProvider();
    provider.addScope('user_birthday');
    provider.addScope('email');
    provider.addScope('public_profile');
    provider.setCustomParameters({
      'display': 'popup'
    });

    this.firebaseLogin(provider);
  }

  public firebaseTwitterLogin() {
    let provider = new firebase.auth.TwitterAuthProvider();
    provider.setCustomParameters({
      'lang': 'en'
    });

    this.firebaseLogin(provider);
  }

  public firebaseGoogleLogin() {
    let provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/plus.login');
    provider.addScope('profile');
    provider.addScope('email');
    provider.setCustomParameters({
      'login_hint': 'user@example.com'
    });

    this.firebaseLogin(provider);
  }

  private toast(message: string, button?: string, duration?: number): void {
    if (!button) {
      button = 'OK';
    }
    if (!duration) {
      duration = this.toastService.toastDuration;
    }
    this.toastService.toast(message, button, duration);
  }

  private silentLogin(): void {
  }

  private showLogin(): void {
    let message: string;
    if (this._user.getValue().displayName) {
      message = "Logged in as " + this._user.getValue().displayName;
    } else {
      message = "Logged in as " + this._user.getValue().email;
    }
    this.toastService.loginToast(this._user.getValue().photoURL, message, this.toastService.toastDuration);
  }

  private showLogout(): void {
    let message = "Logged out";
    this.toast(message);
  }

  private showLoginFailed() {
    let message = "Login Failed";
    this.toast(message);
  }

  private loginCanceled() {
    let message = "Login Canceled";
    this.toast(message);
  }
}
