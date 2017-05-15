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

@Injectable()
export class LoginService {
  // Observable item source
  private _loginStatusSource = new BehaviorSubject<boolean>(false);
  private _isSignedInWithFirebase = new BehaviorSubject<boolean>(false);

  private message: string;
  private loginDialog: MdDialogRef<any>;
  private userSubscription: Subscription;
  private toastLength = 1500;

  // Observable item stream
  loginStatus$ = this._loginStatusSource.asObservable();
  isSignedInWithFirebase = this._isSignedInWithFirebase.asObservable();
  user: User;

  public init(): void {
    this.userSubscription = this.userService.user.subscribe(user => {
      this.user = user;
    });

    firebase.auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        //user is signed in
        this._isSignedInWithFirebase.next(true);
        if (this.user) {
          this.user.firebase = firebaseUser;
        } else {
          this.user = this.userService.createUser(null, null, null, null, null);
          this.user.firebase = firebaseUser;
        }
        if (sessionStorage.getItem('login') == 'true') {
          this.silentLogin();
        } else {
          this.loginSuccess('firebase');
        }

      } else {
        //user is signed out
        if (this._isSignedInWithFirebase.getValue()) {
          this.logOut();
          this._isSignedInWithFirebase.next(false);
        }

      }
    })
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
        this.afAuth.auth.signOut();
        this._isSignedInWithFirebase.next(false);
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

    }
    this.userService.updateUser(this.user);
    this._loginStatusSource.next(true);
    sessionStorage.setItem('login', 'true');
    //no toast
  }

  private loginSuccess(entry: string): void {
    sessionStorage.setItem('login', 'true');
    if (!this.user) {
      console.log(this.user, 'user is not init');
    }
    if (this.loginDialog) {
      this.loginDialog.close('force');
    }
    this.message = "Logged in";
    this.ngZone.run(() => {
      if (entry == 'firebase') {
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
        this.message = "Logged in as " + this.user.fname + " " + this.user.lname;
      }
      this.userService.updateUser(this.user);
      this._loginStatusSource.next(true);
      this.toastService.loginToast(this.user.img, this.message, this.toastLength);
    });
  }

  constructor(private toastService: ToastService, private dialogService: DialogService, private ngZone: NgZone,
              private userService: UserService, private afAuth: AngularFireAuth) {
  }
}
