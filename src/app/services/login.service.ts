import {Injectable, NgZone} from "@angular/core";
import {MdDialogConfig, MdDialogRef} from "@angular/material";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

import {ToastService} from "./toast.service";
import {DialogService} from "./dialog.service";

import {LoginComponent} from "../components/dialogs/login/login.component";
import {LogoutComponent} from "../components/dialogs/logout/logout.component";
import {UserService} from "./user.service";
import {Subscription} from "rxjs/Subscription";
import {User} from "../interfaces/user";

import {AngularFireAuth} from "angularfire2/auth";
import * as firebase from "firebase/app";
import {AngularFireDatabase, FirebaseObjectObservable} from "angularfire2/database";
import {DbCartItem} from "../interfaces/db-cart-item";
import {CartItem} from "../interfaces/cart-item";
import {ProductService} from "./product.service";

@Injectable()
export class LoginService {
  // Observable item source
  private _loginStatusSource = new BehaviorSubject<boolean>(false);
  private _isSignedInWithFirebase = new BehaviorSubject<boolean>(false);


  private message: string;
  private loginDialog: MdDialogRef<any>;
  private userSubscription: Subscription;
  private toastLength = 1500;


  private dbSubscription: Subscription;

  // Observable item stream

  loginStatus$ = this._loginStatusSource.asObservable();
  isSignedInWithFirebase = this._isSignedInWithFirebase.asObservable();
  public user: User;

  private item: FirebaseObjectObservable<any>;

  private addGuestCartItems = false;


  private getFirstName(fname: string): string {
    if (fname) {
      return fname.slice(0, fname.indexOf(" "));
    } else {
      return null;
    }
  }

  private getLastName(lname: string): string {
    if (lname) {
      return lname.slice(lname.indexOf(" "), lname.length);
    } else {
      return null;
    }
  }

  private getCartItem(productId: number, productOptionId: number, cartItem: number): void {
    this.userService._waitingForUpdate.next(true);
    let p = this.productService.getProductByProductId(productId).subscribe((product) => {
      this.user.cartItems[cartItem].product = product;
      let check = true;
      for (let productOption of product.productOptions) {
        if (productOptionId == productOption.productOptionId) {
          this.user.cartItems[cartItem].productOption = productOption;
        }
      }
      for (let cartItem of this.user.cartItems) {
        if (cartItem.product == null) {
          check = false;
        }
      }
      if (check) {
        this.userService._waitingForUpdate.next(false);
      }
      p.unsubscribe();
    });
  }

  private returnCartItems(dbCartItems: DbCartItem[]): CartItem[] {
    let cartItems: CartItem[] = [];


    let i = 0;

    for (let dbCartItem of dbCartItems) {
      let cartItem: CartItem;

      cartItem = {
        product: null,
        productOption: null,
        quantity: dbCartItem.quantity,
        dateAdded: dbCartItem.dateAdded
      };
      this.user.cartItems[i] = cartItem;

      this.getCartItem(dbCartItem.productId, dbCartItem.productOptionId, i);

      i++;
      cartItems.push(cartItem);
    }
    return cartItems;
  }

  public init(): void {
    this.userSubscription = this.userService.user.subscribe(user => {
      this.user = user;
      console.log('initsub', user);
    });


    firebase.auth().onAuthStateChanged((firebaseUser) => {

      console.log('user status change', firebaseUser);
      if (firebaseUser) {
        this.user = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          fname: this.getFirstName(firebaseUser.displayName),
          lname: this.getLastName(firebaseUser.displayName),
          img: firebaseUser.photoURL,
          cartItems: this.user ? this.user.cartItems : []
        } as User;


        this.dbSubscription = this.db.object("users/" + firebaseUser.uid).subscribe((user) => {
          console.log('products', user);
          if (this.addGuestCartItems) {
            let dbCartItems: DbCartItem[] = [];
            for (let cartItem of this.user.cartItems) {
              let dbCartItem: DbCartItem = {
                productId: cartItem.product.productId,
                productOptionId: cartItem.productOption.productOptionId,
                quantity: cartItem.quantity,
                dateAdded: cartItem.dateAdded
              };
              dbCartItems.push(dbCartItem);
            }
            for (let dcartItem of user.cartItems) {
              let dbCartItem: DbCartItem = dcartItem;
              let i = 0;
              let check: boolean = true;
              for (let checkItem of this.user.cartItems) {
                if (checkItem.productOption.productOptionId == dcartItem.productOptionId) {
                  dbCartItems[i].quantity += dcartItem.quantity;
                  check = false;
                }
              }
              if (check) {
                dbCartItems.push(dbCartItem);
              }
              i++;
            }
            console.log(dbCartItems);
            this.item = this.db.object('/users/' + this.user.id);
            this.item.update({cartItems: dbCartItems});
            this.returnCartItems(dbCartItems);
            this.addGuestCartItems = false;
          } else {

            if (user.cartItems) {
              this.returnCartItems(user.cartItems);
            }
            this.userService.setUser(this.user);
          }
        });

        //user is signed in
        this._isSignedInWithFirebase.next(true);


        if (sessionStorage.getItem('login') == 'true') {
          this.silentLogin();
        } else {
          this.loginSuccess();
        }

      } else {
        //user is signed out
        if (this._isSignedInWithFirebase.getValue()) {
          this.addGuestCartItems = true;
          console.log('logged out of firebase');

          this._isSignedInWithFirebase.next(false);
          this.userService.updateUser(this.user);
          this.logOut();
          this.userService.logout();
          this.userService.userToGuest();
        } else {
          console.log('limbo');
          let guest = this.userService.getUserFromLocalStorage();
          if (guest) {
            this.userService.updateUser(guest);
          } else {
            this.userService.userToGuest();
          }
          this.addGuestCartItems = true;
          //user is not signed in and
        }


      }
    });
  }

  public changeLoginStatus(boolean) {
    if (boolean) {
      this.loginDialog = this.dialogService.openDialog(LoginComponent, new MdDialogConfig());
      this.loginDialog.componentInstance.showLoginText = true;
      this.loginDialog.componentInstance.loginService = this;
      this.loginDialog.afterClosed().subscribe(loginResult => {
        setTimeout(() => {
          if (this._loginStatusSource.getValue() == false) {
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
          //default logout
          this.logOut();
        } else {
          //canceled logout
        }
      });
    }
  }

  private firebaseLogin(provider: any) {
    this.afAuth.auth.signInWithPopup(provider).then((result) => {
      //have event handler to handle this
    }).catch((error: any) => {

      this.loginFailed();

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

  public firebaseEmailLogin(email: string, password: string): Promise<string> {
    let message = new Promise((resolve => {
      this.afAuth.auth.signInWithEmailAndPassword(email, password).then(reponse => {
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

  public firebaseCreateUserFromEmail(email: string, password: string): Promise<string> {
    let message = new Promise((resolve, reject) => {
      this.afAuth.auth.createUserWithEmailAndPassword(email, password).then((response) => {

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

  public firebasePasswordReset(email: string) {
    this.afAuth.auth.sendPasswordResetEmail(email);
  }

  public firebaseConfirmPasswordReset(code: string, pw: string) {
    this.afAuth.auth.confirmPasswordReset(code, pw);
  }

  public firebaseVerifyPasswordReset(code: string) {
    this.afAuth.auth.verifyPasswordResetCode(code);
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

  private toast(message) {
    this.toastService.toast(message, 'OK', this.toastLength);
  }

  private loginCanceled() {
    this.message = "Login Canceled";
    this.ngZone.run(() => {
      this._loginStatusSource.next(false);
      this.toast(this.message);
    });
  }

  private loginFailed() {
    this.message = "Login Failed";
    this.ngZone.run(() => {
      this._loginStatusSource.next(false);
      this.toast(this.message);
    });
  }

  private logOut(): void {
    this.message = "Logged out";

    this.ngZone.run(() => {
      if (this._isSignedInWithFirebase.getValue()) {
        this.userService.logout();
        this.afAuth.auth.signOut();
      }
      sessionStorage.setItem('login', 'false');

      this._loginStatusSource.next(false);
      this.toast(this.message);
    });
  }

  private silentLogin(): void {
    //shouldn't need this anymore
    if (this.loginDialog) {
      this.loginDialog.close('force');
    }

    //this.setUserData();

    this._loginStatusSource.next(true);
    sessionStorage.setItem('login', 'true');
    //no toast
  }

  private setUserData() {
    if (this._isSignedInWithFirebase.getValue()) {
      this.user.email = this.user.firebase.email;
      if (this.user.firebase.displayName) {
        this.user.fname = this.user.firebase.displayName.slice(0, this.user.firebase.displayName.indexOf(" "));
        this.user.lname = this.user.firebase.displayName.slice(this.user.firebase.displayName.indexOf(" "), this.user.firebase.displayName.length);
      } else {
        this.user.fname = this.user.email;
        this.user.lname = "";
      }
      if (this.user.firebase.photoURL) {
        this.user.img = this.user.firebase.photoURL;
      } else {
        this.user.img = null;
      }
      this.user.id = this.user.firebase.uid;
      this.message = "Logged in as " + this.user.fname + " " + this.user.lname;
    } else {
      //for future use if another auth platform is added
    }


    //after logins check if signed in user is all ready a user then load current info;

    this.userService.updateUser(this.user);
  }

  private loginSuccess(): void {
    sessionStorage.setItem('login', 'true');
    if (!this.user) {
      console.log(this.user, 'user is not init');
    }
    if (this.loginDialog) {
      this.loginDialog.close('force');
    }
    this.message = "Logged in";
    this.ngZone.run(() => {


      if (this._isSignedInWithFirebase.getValue()) {
        if (this.user.fname) {
          this.message = "Logged in as " + this.user.fname + " " + this.user.lname;
        } else {
          this.message = "Logged in as " + this.user.email;
        }
      }


      this._loginStatusSource.next(true);
      this.toastService.loginToast(this.user.img, this.message, this.toastLength);
    });
  }

  constructor(private toastService: ToastService, private dialogService: DialogService, private ngZone: NgZone,
              private userService: UserService, private afAuth: AngularFireAuth, private db: AngularFireDatabase, private productService: ProductService) {

  }
}
