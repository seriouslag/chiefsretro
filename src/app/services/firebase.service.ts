import {Injectable} from "@angular/core";
import {AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable} from "angularfire2/database";
import {AngularFireAuth} from "angularfire2/auth";
import {ToastService} from "./toast.service";
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
import {Order} from "../interfaces/order";
import "rxjs/add/operator/take";
import {FromStripeToken} from "../interfaces/from-stripe-token";
import * as firebase from "firebase/app";
import {User} from "firebase/app";

@Injectable()
export class FirebaseService {

  private loggedInSubscription: Subscription;
  private productsSubscription: Subscription;
  private cartDialog: MdDialogRef<any>;
  private loginDialog: MdDialogRef<LoginComponent>;

  private isInit = false;

  public _signedIn = new BehaviorSubject<boolean>(false);
  public signedIn = this._signedIn.asObservable();
  public _user = new BehaviorSubject<User>(null);
  public user = this._user.asObservable();
  public dbcart: DbCartItem[];
  public _dbcart: FirebaseListObservable<any>;
  public _cart = new BehaviorSubject<CartItem[]>([]);
  public cart = this._cart.asObservable();
  public products: Product[];


  constructor(private af: AngularFireAuth, private db: AngularFireDatabase, private toastService: ToastService,
              private dialogService: DialogService) {
    this.productsSubscription = this.db.list('products/')
      .subscribe((products: Product[]) => {
        this.products = products;
        sessionStorage.setItem('products', JSON.stringify(this.products));
        if (this.isInit === false) {
          this.init();
        }
      }, (error) => {
        alert('FATAL ERROR: if you see Landon tell him.');
        console.log(error);
      });
  }

  public setCart(cartItems: CartItem[]): void {
    if (this._user.getValue()) {
      if (cartItems.length) {
        for (const cartItem of cartItems) {
          if (cartItem.quantity === 0) {
            this.db.object('users/' + this._user.getValue().uid + '/cartItems/' + cartItem.productOption.productOptionId).remove();
          } else {

            const dbCartItem: DbCartItem = {
              productId: cartItem.product.productId,
              productOptionPrice: cartItem.productOption.productPrice,
              productOptionId: cartItem.productOption.productOptionId,
              quantity: cartItem.quantity,
              dateAdded: cartItem.dateAdded
            };
            this.db.object('users/' + this._user.getValue().uid + '/cartItems/' + cartItem.productOption.productOptionId).set(dbCartItem);
          }
        }
      } else {
        this.db.object('users/' + this._user.getValue().uid + '/cartItems/').remove();
      }
    } else {
      // no user is signed in
      this._cart.next(cartItems);
    }
  }

  public cartToDbCart(cart: CartItem[]): DbCartItem[] {
    const dbCart: DbCartItem[] = [];
    for (const cartItem of cart) {
      dbCart.push(<DbCartItem>{
        productId: cartItem.product.productId,
        productOptionId: cartItem.productOption.productOptionId,
        quantity: cartItem.quantity,
        dateAdded: cartItem.dateAdded,

        productOptionPrice: cartItem.productOption.productPrice
      });
    }
    return dbCart;
  }

  public dbCartToCart(dbCart: DbCartItem[]): CartItem[] {
    const cart: CartItem[] = [];
    for (const dbCartItem of dbCart) {
      cart.push(<CartItem>{
        product: this.getProductByProductId(dbCartItem.productId),
        productOption: this.getProductOptionByProductOptionId(dbCartItem.productOptionId),
        quantity: dbCartItem.quantity,
        dateAdded: dbCartItem.dateAdded,

        productOptionPrice: dbCartItem.productOptionPrice
      });
    }
    return cart;
  }

  getDBProductByProductId(id: number): FirebaseObjectObservable<Product> {
    return this.db.object('products/' + id);
  }

  public getProductByProductId(id: number): Product {
    for (const product of this.products) {
      if (product.productId === id) {
        return product;
      }
    }
    return null;
  }

  public getProductOptionByProductOptionId(id: number): ProductOption {
    for (const product of this.products) {
      for (const productOption of product.productOptions) {
        if (productOption.productOptionId === id) {
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

      const tempCart: DbCartItem[] = this.dbcart;
      let i = 0;
      let checkForProduct = true;

      for (const cartItem of tempCart) {
        if (cartItem.productOptionId === productOption.productOptionId) {
          tempCart[i].quantity += quantity;
          this.db.object('users/' + this._user.getValue().uid + '/cartItems/' + cartItem.productOptionId).set(tempCart[i]);
          checkForProduct = false;
          break;
        }
        i++;
      }
      if (checkForProduct) {

        const dbCartItem: DbCartItem = {
          productId: product.productId,
          productOptionId: productOption.productOptionId,
          productOptionPrice: productOption.productPrice,
          quantity: quantity,
          dateAdded: dateAdded
        };
        this.db.object('users/' + this._user.getValue().uid + '/cartItems/' + productOption.productOptionId).set(dbCartItem)
      }
    } else {
      // guest add to cart
      const tempCart = this._cart.getValue();
      let i = 0;
      let checkForProduct = true;

      for (const cartItems of tempCart) {
        if (cartItems.productOption.productOptionId === productOption.productOptionId) {
          tempCart[i].quantity += quantity;
          checkForProduct = false;
        }
        i++;
      }
      if (checkForProduct) {
        const tempCartItem: CartItem = {
          product: product,
          productOption: productOption,
          quantity: quantity,
          dateAdded: dateAdded
        };

        tempCart.push(tempCartItem);
      }
      localStorage.setItem('cartDate', Date.now().toString());
      localStorage.setItem('cart', JSON.stringify(tempCart));
      this._cart.next(tempCart);
      console.log('guest add to cart');

    }
    if (showToast) {
      this.toast('Added ' + quantity + ' ' + productOption.productColor + ' ' + product.productName + ' To Cart');
    }
  }

  public removeProductFromCart(product: Product, productOption: ProductOption, quantity: number,
                               showToast?: boolean, checkBeforeRemove?: boolean) {
    if (showToast == null) {
      showToast = true;
    }
    if (checkBeforeRemove == null) {
      checkBeforeRemove = true;
    }
    if (this._user.getValue()) {
      const tempCart = this.dbcart;

      let i = 0;
      for (const cartItem of tempCart) {
        if (cartItem.productOptionId === productOption.productOptionId) {
          if (tempCart[i].quantity - quantity <= 0) {
            if (checkBeforeRemove) {
              this.cartDialog = this.dialogService.openDialog(CancelComponent, {});
              this.cartDialog.componentInstance.customText = 'Remove from cart?';
              let result = false;
              this.cartDialog.afterClosed().subscribe(cartResult => {
                // if the user wants to remove item then do so
                if (cartResult) {
                  this.db.object('users/' + this._user.getValue().uid + '/cartItems/' + productOption.productOptionId).remove();
                  if (showToast) {
                    this.toast('Removed ' + quantity + ' ' + productOption.productColor + ' ' + product.productName + ' From Cart');
                  }
                }
                result = true;
              });
            } else {
              // no dialog
              this.db.object('users/' + this._user.getValue().uid + '/cartItems/' + productOption.productOptionId).remove();
              if (showToast) {
                this.toast('Removed ' + quantity + ' ' + productOption.productColor + ' ' + product.productName + ' From Cart');
              }
            }
          } else {
            tempCart[i].quantity -= quantity;
            this.db.object('users/' + this._user.getValue().uid + '/cartItems/' + productOption.productOptionId).set(tempCart[i]);
            if (showToast) {
              this.toast('Removed ' + quantity + ' ' + productOption.productColor + ' ' + product.productName + ' From Cart');
            }
            break;
          }
        }
        i++;
      }
    } else {
      // guest remove item
      const tempCart: CartItem[] = this._cart.getValue();
      let i = 0;
      let tempIndex: number;

      for (const cartItems of tempCart) {
        if (cartItems.productOption.productOptionId === productOption.productOptionId) {
          if (tempCart[i].quantity - quantity <= 0) {
            tempIndex = i;
            this.cartDialog = this.dialogService.openDialog(CancelComponent, {});
            this.cartDialog.componentInstance.customText = 'Remove from cart?';

            if (checkBeforeRemove) {
              this.cartDialog.afterClosed().subscribe(cartResult => {
                if (cartResult) {
                  tempCart.splice(tempIndex, 1);
                  if (showToast) {
                    this.toast('Removed ' + quantity + ' ' + productOption.productColor + ' ' + product.productName + ' From Cart');
                  }
                  localStorage.setItem('cart', JSON.stringify(tempCart));
                  localStorage.setItem('cartDate', Date.now().toString());
                  this._cart.next(tempCart);
                }
              });
            } else {
              // no dialog
              tempCart.splice(tempIndex, 1);
              if (showToast) {
                this.toast('Removed ' + quantity + ' ' + productOption.productColor + ' ' + product.productName + ' From Cart');
              }
              localStorage.setItem('cartDate', Date.now().toString());
              localStorage.setItem('cart', JSON.stringify(tempCart));
              this._cart.next(tempCart);
            }
          } else {
            tempCart[i].quantity -= quantity;
            this._cart.next(tempCart);
            if (showToast) {
              this.toast('Removed ' + quantity + ' ' + productOption.productColor + ' ' + product.productName + ' From Cart');
            }
            localStorage.setItem('cartDate', Date.now().toString());
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
          if (this._signedIn.getValue() === false) {
            if (loginResult === 'force') {
              // do nothing
            } else if (loginResult === 'firebase') {
              // handled elsewhere to avoid popup blocker
            } else {
              // this.loginCanceled();
              // kind of annoying
            }
          }
        }, 150);
      });
    } else {
      // do log out;
      const logoutDialog = this.dialogService.openDialog(LogoutComponent, new MdDialogConfig());
      logoutDialog.afterClosed().subscribe(logoutResult => {
        if (logoutResult) {

          // disconnect from db before signing out
          if (this._dbcart) {
            this._dbcart.$ref.off();
          }
          this._cart.next([]);
          this.dbcart = [];

          localStorage.setItem('cartDate', Date.now().toString());
          localStorage.setItem('cart', '');

          this.af.auth.signOut();
        } else {
          // canceled logout
        }
      });
    }
  }

  public firebaseCreateUserFromEmail(email: string, password: string, name?: string): Promise<string> {
    if (name == null) {
      name = '';
    }
    return new Promise((resolve) => {
      this.af.auth.createUserWithEmailAndPassword(email, password).then((response) => {
        console.log(response);
        this.db.object('users/' + response.uid).set({email: email, name: name, created: Date.now()});
        resolve('ok');
      }).catch((error: any) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        this.toast(errorMessage);
        if (errorCode === 'auth/weak-password') {
        } else if (errorCode === 'auth/invalid-email') {
        } else if (errorCode === 'auth/email-already-in-use') {
        } else if (errorCode === 'auth/operation-not-allowed') {
        } else {
          console.log('An unknown error occured', error);
        }
        resolve(errorCode);
      })
    });
  }

  private firebaseLogin(provider: any) {
    this.af.auth.signInWithPopup(provider).then((result) => {
      // have event handler to handle this
    }).catch((error: any) => {
      this.showLoginFailed();
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      const credential = error.credential;

      this.toastService.toast(errorMessage);

      // [START_EXCLUDE]
      if (errorCode === 'auth/account-exists-with-different-credential') {
        alert('You have already signed up with a different auth provider for that email.');
        // If you are using multiple auth providers on your app you should handle linking
        // the user's accounts here.
      } else if (errorCode === 'auth/network-request-failed') {
        this.toast('Cannot connect to Google\'s services right now.');
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
        // not logged in
        if (this._signedIn.getValue()) {
          // if was logged in then show logout message
          this.showLogout();
        } else {

          // check localstorage for cartitems then assign them to cartItems

          /*
           TODO if localStorage is older than lastOrder date, remove localstorage and do not use as new cart.
           */
          const cart = localStorage.getItem('cart');
          if (cart) {
            if (cart.length) {
              this._cart.next(JSON.parse(cart));
            }
          }
        }
        this._signedIn.next(false);

      } else {
        // logged in

        // set/update user data in db
        const userData = {
          name: user.displayName,
          email: user.email,
          emailVerified: user.emailVerified,
          lastLoggedIn: Date.now()
        };

        this.db.object('users/' + user.uid).update(userData);

        if (sessionStorage.getItem('login') === 'true') {
          this.silentLogin();
        } else {
          this.showLogin();
        }

        sessionStorage.setItem('login', 'true');
        this._signedIn.next(true);

        // connect cart to database
        this._dbcart = this.db.list('users/' + user.uid + '/cartItems/');

        // localcart to overwrite stored cart

        const localCart = this._cart.getValue();
        console.log('guest to login cart', localCart);
        if (localCart.length) {
          this.setCart(localCart);
          this._cart.next(localCart);
          localStorage.setItem('cart', '');
        }

        this._dbcart.subscribe((dbcart: DbCartItem[]) => {
          this.dbcart = dbcart;
          const cart: CartItem[] = [];
          for (const dbCartItem of dbcart) {
            const cartItem: CartItem = {
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
      this.isInit = true;
    });
  }

  public saveToDb(path: string, data: any): Promise<boolean> {
    let promise;
    if (path != null && data != null) {
      promise = this.db.object(path).set(data).then(resolve => promise.resolve(true));
    } else {
      promise = new Promise(resolve => resolve(false));
    }
    return promise;
  }

  public fromStripeTokenToStripeToken(fromStripeToken: FromStripeToken): StripeToken {
    const token = <StripeToken>{
      email: fromStripeToken.email,
      id: fromStripeToken.id,
      clientIp: fromStripeToken.client_ip,
      livemode: fromStripeToken.livemode,
      type: fromStripeToken.type,
      used: fromStripeToken.used
    };
    console.log(token);
    return token;
  }

  // Call when receive tokens back from stripe
  public saveOrderToDb(token: StripeToken, args: StripeArgs, total: number, cart: CartItem[]): Promise<string> {
    const date = Date.now();
    const dbCart: DbCartItem[] = this.cartToDbCart(cart);

    if (this._user.getValue()) {
      this.db.object('users/' + this._user.getValue().uid + '/orders/' + date).set('processing');
      this.db.object('orders/' + this._user.getValue().uid + '/' + date).set(<Order>{
        email: token.email,
        date: date,
        cart: dbCart,
        token: token,
        args: args,
        status: 'processing',
        total: total,
      });
      return new Promise(resolve => {
        resolve(date);
      });
    } else {
      const key = this.db.list('orders/').push('').key;
      this.db.object('orders/' + key + '/' + date).set(<Order>{
        email: token.email,
        date: date,
        cart: dbCart,
        token: token,
        args: args,
        status: 'processing',
        total: total
      });
      return new Promise(resolve => {
        resolve(date + '/' + key);
      });
    }
  }

  getAllOrders() {
    if (this._user.getValue()) {
      return this.db.list('orders/' + this._user.getValue().uid);
    }
  }

  public getOrderByOrderId(orderId: string, custId?: string): FirebaseObjectObservable<Order> {
    // userOrders is a check to that should already have been completed
    // it checks if the order is connected to to a user account
    let path = '';
    if (custId == null && this._user.getValue()) {
      path = 'orders/' + this._user.getValue().uid + '/' + orderId;
    } else {
      path = 'orders/' + custId + '/' + orderId;
    }
    return this.db.object(path);

  }

  public firebaseEmailLogin(email: string, password: string): Promise<string> {
    return new Promise((resolve => {
      this.af.auth.signInWithEmailAndPassword(email, password).then(response => {
        resolve('ok');
      }).catch((error: any) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        this.toast(errorMessage);
        if (errorCode === 'auth/user-disabled') {
        } else if (errorCode === 'auth/invalid-email') {
        } else if (errorCode === 'auth/user-not-found') {
        } else if (errorCode === 'auth/wrong-password') {
        } else {
          console.log('An unknown error occured', error);
        }
        resolve(errorCode);
      });
    }));
  }

  public firebaseFacebookLogin() {
    const provider = new firebase.auth.FacebookAuthProvider();
    provider.addScope('user_birthday');
    provider.addScope('email');
    provider.addScope('public_profile');
    provider.setCustomParameters({
      'display': 'popup'
    });

    this.firebaseLogin(provider);
  }

  public firebaseTwitterLogin() {
    const provider = new firebase.auth.TwitterAuthProvider();
    provider.setCustomParameters({
      'lang': 'en'
    });

    this.firebaseLogin(provider);
  }

  public firebaseGoogleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
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
    // do nothing; handled by auth subscription
  }

  private showLogin(): void {
    // close dialog if you get to this point
    if (this.loginDialog) {
      this.loginDialog.close('force');
    }
    if (this.cartDialog) {
      this.cartDialog.close();
    }

    let message: string;
    if (this._user.getValue().displayName) {
      message = 'Logged in as ' + this._user.getValue().displayName;
    } else {
      message = 'Logged in as ' + this._user.getValue().email;
    }
    this.toastService.loginToast(this._user.getValue().photoURL, message, this.toastService.toastDuration);
  }

  private showLogout(): void {
    const message = 'Logged out';
    this.toast(message);
  }

  private showLoginFailed() {
    const message = 'Login Failed';
    this.toast(message);
  }

  private loginCanceled() {
    const message = 'Login Canceled';
    this.toast(message);
  }
}
