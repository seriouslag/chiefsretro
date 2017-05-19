import {Injectable, NgZone} from "@angular/core";
import {AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable} from "angularfire2/database";
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
import {StripeArgs} from "../interfaces/stripe-args";
import {StripeToken} from "../interfaces/stripe-token";

@Injectable()
export class FirebaseService {

  private loggedInSubscription: Subscription;
  private productsSubscription: Subscription;
  private cartDialog: MdDialogRef<any>;
  private loginDialog: MdDialogRef<LoginComponent>;

  private isInit: boolean = false;

  public _signedIn = new BehaviorSubject<boolean>(false);
  public signedIn = this._signedIn.asObservable();
  public _user = new BehaviorSubject<User>(null);
  public user = this._user.asObservable();
  public dbcart: DbCartItem[];
  public _dbcart: FirebaseListObservable<any>;
  public _cart = new BehaviorSubject<CartItem[]>([]);
  public cart = this._cart.asObservable();
  public products: Product[];

  constructor(private af: AngularFireAuth, private db: AngularFireDatabase, private toastService: ToastService, private dialogService: DialogService, private ngZone: NgZone) {
    let products = sessionStorage.getItem('products');


    if (products) {
      this.products = JSON.parse(products);
      this.init();
    } else {
      this.productsSubscription = this.db.list('products/')
        .subscribe((products: Product[]) => {
          this.products = products;
          sessionStorage.setItem('products', JSON.stringify(this.products));
          if (this.isInit == false) {
            this.init();
          }
        }, (error) => {
          alert('FATAL ERROR: if you see Landon tell him.');
          console.log(error);
        });
    }
  }

  public setCart(cartItems: CartItem[]): void {
    for (let cartItem of cartItems) {
      if (cartItem.quantity == 0) {
        this.db.object('users/' + this._user.getValue().uid + "/cartItems/" + cartItem.productOption.productOptionId).remove();
      } else {

        let dbCartItem: DbCartItem = {
          productId: cartItem.product.productId,
          productOptionId: cartItem.productOption.productOptionId,
          quantity: cartItem.quantity,
          dateAdded: cartItem.dateAdded
        };
        this.db.object('users/' + this._user.getValue().uid + "/cartItems/" + cartItem.productOption.productOptionId).set(dbCartItem);
      }

    }
  }

  getDBProductByProductId(id: number): FirebaseObjectObservable<Product> {
    let product: FirebaseObjectObservable<Product> = this.db.object('products/' + id);
    return product;
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

  public updateCart(cart: CartItem[]) {
    this.setCart(cart);
  }

  public addProductToCart(product: Product, productOption: ProductOption, quantity: number, dateAdded: number, showToast?: boolean) {
    if (showToast == null) {
      showToast = true;
    }
    if (this._user.getValue()) {

      let tempCart: DbCartItem[] = this.dbcart;

      let i = 0;
      let checkForProduct = true;

      for (let cartItem of tempCart) {
        if (cartItem.productOptionId == productOption.productOptionId) {
          tempCart[i].quantity += quantity;
          this.db.object('users/' + this._user.getValue().uid + "/cartItems/" + cartItem.productOptionId).set(tempCart[i]);
          checkForProduct = false;
          break;
        }
        i++;
      }
      if (checkForProduct) {

        let dbCartItem: DbCartItem = {
          productId: product.productId,
          productOptionId: productOption.productOptionId,
          quantity: quantity,
          dateAdded: dateAdded
        };
        this.db.object('users/' + this._user.getValue().uid + '/cartItems/' + productOption.productOptionId).set(dbCartItem)
      }
    } else {
      //guest add to cart
      let tempCart = this._cart.getValue();
      let i = 0;

      let checkForProduct: boolean = true;

      for (let cartItems of tempCart) {
        if (cartItems.productOption.productOptionId == productOption.productOptionId) {
          tempCart[i].quantity += quantity;
          checkForProduct = false;
        }
        i++;
      }
      if (checkForProduct) {
        let tempCartItem: CartItem = {
          product: product,
          productOption: productOption,
          quantity: quantity,
          dateAdded: dateAdded
        };

        tempCart.push(tempCartItem);
      }

      localStorage.setItem('cart', JSON.stringify(tempCart));
      this._cart.next(tempCart);
      console.log('guest add to cart');

    }
    if (showToast) {
      this.toast('Added ' + quantity + ' ' + productOption.productColor + ' ' + product.productName + ' To Cart');
    }
  }

  public removeProductFromCart(product: Product, productOption: ProductOption, quantity: number, showToast?: boolean, checkBeforeRemove?: boolean) {
    if (showToast == null) {
      showToast = true;
    }
    if (checkBeforeRemove == null) {
      checkBeforeRemove = true;
    }
    if (this._user.getValue()) {
      let tempCart = this.dbcart;

      let i = 0;
      for (let cartItem of tempCart) {
        if (cartItem.productOptionId == productOption.productOptionId) {
          if (tempCart[i].quantity - quantity <= 0) {
            if (checkBeforeRemove) {
              this.cartDialog = this.dialogService.openDialog(CancelComponent, {});
              this.cartDialog.componentInstance.customText = "Remove from cart?";
              let result = false;
              this.cartDialog.afterClosed().subscribe(cartResult => {
                //if the user wants to remove item then do so
                if (cartResult) {
                  this.db.object('users/' + this._user.getValue().uid + "/cartItems/" + productOption.productOptionId).remove();
                  if (showToast) {
                    this.toast('Removed ' + quantity + ' ' + productOption.productColor + ' ' + product.productName + ' From Cart');
                  }
                }
                result = true;
              });
            } else {
              //no dialog
              this.db.object('users/' + this._user.getValue().uid + "/cartItems/" + productOption.productOptionId).remove();
              if (showToast) {
                this.toast('Removed ' + quantity + ' ' + productOption.productColor + ' ' + product.productName + ' From Cart');
              }
            }
          } else {
            tempCart[i].quantity -= quantity;
            this.db.object('users/' + this._user.getValue().uid + "/cartItems/" + productOption.productOptionId).set(tempCart[i]);
            if (showToast) {
              this.toast('Removed ' + quantity + ' ' + productOption.productColor + ' ' + product.productName + ' From Cart');
            }
            break;
          }
        }
        i++;
      }
    } else {
      //guest remove item
      let tempCart: CartItem[] = this._cart.getValue();
      let i: number = 0;
      let tempIndex: number;

      for (let cartItems of tempCart) {
        if (cartItems.productOption.productOptionId == productOption.productOptionId) {
          if (tempCart[i].quantity - quantity <= 0) {
            tempIndex = i;
            this.cartDialog = this.dialogService.openDialog(CancelComponent, {});
            this.cartDialog.componentInstance.customText = "Remove from cart?";

            if (checkBeforeRemove) {
              this.cartDialog.afterClosed().subscribe(cartResult => {
                if (cartResult) {
                  tempCart.splice(tempIndex, 1);
                  if (showToast) {
                    this.toast('Removed ' + quantity + ' ' + productOption.productColor + ' ' + product.productName + ' From Cart');
                  }
                  localStorage.setItem('cart', JSON.stringify(tempCart));
                  this._cart.next(tempCart);
                }
              });
            } else {
              //no dialog
              tempCart.splice(tempIndex, 1);
              if (showToast) {
                this.toast('Removed ' + quantity + ' ' + productOption.productColor + ' ' + product.productName + ' From Cart');
              }
              localStorage.setItem('cart', JSON.stringify(tempCart));
              this._cart.next(tempCart);
            }
          } else {
            tempCart[i].quantity -= quantity;
            this._cart.next(tempCart);
            if (showToast) {
              this.toast('Removed ' + quantity + ' ' + productOption.productColor + ' ' + product.productName + ' From Cart');
            }
            localStorage.setItem('cart', JSON.stringify(tempCart));
          }
        }
        i++;
      }
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
              //this.loginCanceled();
              //kind of annoying
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
          this._cart.next([]);
          this.dbcart = [];

          localStorage.setItem('cart', '');

          this.af.auth.signOut();
        } else {
          //canceled logout
        }
      });
    }
  }

  public firebaseCreateUserFromEmail(email: string, password: string, name?: string): Promise<string> {
    let message = new Promise((resolve, reject) => {
      this.af.auth.createUserWithEmailAndPassword(email, password).then((response) => {
        this.db.object('users/' + this._user.getValue().uid).set({email: email, name: name, created: Date.now()});
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

      this.toastService.toast(errorMessage);

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

  private init(): void {
    this.loggedInSubscription = this.af.authState.subscribe(user => {
      this._user.next(user);

      if (user == null) {
        sessionStorage.setItem('login', 'false');
        //not logged in
        if (this._signedIn.getValue()) {
          //if was logged in then show logout message
          this.showLogout();
        } else {

          //check localstorage for cartitems then assign them to cartItems
          let cart = localStorage.getItem('cart');
          console.log('localstore', cart);
          if (cart) {
            if (cart.length) {
              this._cart.next(JSON.parse(cart));
            }
          }
        }
        this._signedIn.next(false);

      } else {
        //logged in

        //set/update user data in db
        let userData = {
          name: user.displayName,
          email: user.email,
          emailVerified: user.emailVerified,
          lastLoggedIn: Date.now()
        };

        this.db.object('users/' + user.uid).update(userData);

        if (sessionStorage.getItem('login') == 'true') {
          this.silentLogin();
        } else {
          this.showLogin();
        }

        sessionStorage.setItem('login', 'true');
        this._signedIn.next(true);

        //connect cart to database
        this._dbcart = this.db.list('users/' + user.uid + "/cartItems/");

        //localcart to overwrite stored cart

        let localCart = this._cart.getValue();
        console.log('guest to login cart', localCart);
        if (localCart.length) {
          this.setCart(localCart);
          this._cart.next(localCart);
          localStorage.setItem('cart', '');
        }

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

          if (cart.length) {
            console.log('from db cart', cart);
            this._cart.next(cart);
          }
        });
      }
      this.isInit = true;
    });
  }

  public saveToDb(path: string, data: any): Promise<any> {
    let promise;
    if (path != null && data != null) {
      promise = this.db.object(path).set(data).then(
        promise.resolve(true)
      );
    } else {
      promise.resolve(false);
    }
    return promise;
  }

  public saveStripeToDb(token, args): firebase.Promise<void> {
    return this.db.object('orders/' + this._user.getValue().uid + '/' + Date.now()).set({
      token: token as StripeToken,
      args: args as StripeArgs
    });

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

  public firebasePasswordReset(email: string) {
    this.af.auth.sendPasswordResetEmail(email);
  }

  public firebaseConfirmPasswordReset(code: string, pw: string) {
    this.af.auth.confirmPasswordReset(code, pw);
  }

  public firebaseVerifyPasswordReset(code: string) {
    this.af.auth.verifyPasswordResetCode(code);
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
    if (this.loginDialog) {
      this.loginDialog.close('force');
    }
    if (this.cartDialog) {
      this.cartDialog.close();
    }
    //do nothing; handled by auth subscription
  }

  private showLogin(): void {
    //close dialog if you get to this point
    if (this.loginDialog) {
      this.loginDialog.close('force');
    }
    if (this.cartDialog) {
      this.cartDialog.close();
    }

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
