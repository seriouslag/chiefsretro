import {Injectable, NgZone} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ToastService} from "./toast.service";
import {DialogService} from "./dialog.service";
import {LoginComponent} from "../components/dialogs/login/login.component";
import {MdDialogConfig} from "@angular/material";
import {LogoutComponent} from "../components/dialogs/logout/logout.component";

declare const gapi: any;
declare const FB: any;



@Injectable()
export class LoginService {
  // Observable item source
  private _loginStatusSource = new BehaviorSubject<boolean>(false);
  private message: string;
  // Observable item stream
  loginStatus$ = this._loginStatusSource.asObservable();
  // service command
  private _isSignedInWithGoogle = new BehaviorSubject<boolean>(false);
  private _isSignedInWithFb = new BehaviorSubject<boolean>(false);

  isSignedInWithGoogle = this._isSignedInWithGoogle.asObservable();
  isSignedInWithFb = this._isSignedInWithFb.asObservable();
  isFbInit: boolean = false;

  user: any = {};
  fbuser: any;
  guser: any;

  private auth2: any;
  button: any;

  changeLoginStatus(boolean) {
    if (boolean) {
      let loginDialog = this.dialogService.openDialog(LoginComponent, new MdDialogConfig());
      loginDialog.componentInstance.showLoginText = true;
      loginDialog.afterClosed().subscribe(loginResult => {
        if (loginResult == "google") {
          this.googleLogin();
        } else if (loginResult == "default") {
          //login api
          this.loginSuccess('default');
        } else if (loginResult == 'fb') {
          this.fbLogin();
        } else {
          this.loginCanceled();
        }
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

  private fbInit() {
    FB.init({
      //seriouslag.com
      appId: '859605290845454',
      //localhost appId: '859537694185547',
      cookie: true,
      xfbml: true,
      version: 'v2.9'
    });
    FB.AppEvents.logPageView();
    this.isFbInit = true;
  }

  private fbLogin() {
    if (this.isFbInit == false) {
      this.fbInit();
    }

    FB.getLoginStatus((response) => {
      if (response.status == "not_authorized") {
        FB.login((response) => {
          if (response.status = "connected") {
            this.getFbProfileFromFbLoginResponse(response)
          }
        }, {scope: 'email,user_likes'});
      } else if (response.status = "connected") {
        FB.login((response) => {
          if (response.status = "connected") {
            this.getFbProfileFromFbLoginResponse(response)
          }
        }, {scope: 'email,user_likes'});
      } else {
        //unknown response trying to log in anyways
        FB.login((response) => {
          if (response.status = "connected") {
            this.getFbProfileFromFbLoginResponse(response)
          }
        }, {scope: 'email,user_likes'});
      }
    });
  }

  private getFbProfileFromFbLoginResponse(response: any): void {
    //get user profile from response
    FB.api("/" + response.authResponse.userID, (user) => {
      this.user.fb = user;
      this.loginSuccess('fb');
    });
  }

  private googleLogin() {
    gapi.load('auth2', () => {
      gapi.auth2.init({
        client_id: '917853947579-aukq6soleijkjemi7ln3usavpg7l7nb1.apps.googleusercontent.com',
        cookiepolicy: 'single_host_origin',
        scope: 'profile email'
      }).then((auth2) => {
        this.auth2 = auth2;
        this.auth2.signIn().then(() => {
          this.user.google = this.auth2.currentUser.get();
          if (this.user.google.isSignedIn()) {
            this.loginSuccess('google');
          } else {
            this.loginFailed();
          }
        }, (error) => {
          this.loginFailed();
        });
      });
    });
  }

  private loginCanceled() {
    this.message = "Login Canceled";
    this.ngZone.run(() => {
      this._loginStatusSource.next(false);
      this.toastService.toast(this.message, 'OK', 1000);
    });
  }

  private loginFailed() {
    this.message = "Login Failed";
    this.ngZone.run(() => {
      this._loginStatusSource.next(false);
      this.toastService.toast(this.message, 'OK', 1000);
    });
  }

  private logOut(): void {
    this.message = "Logged out";
    this.ngZone.run(() => {
      if (this._isSignedInWithGoogle.getValue()) {
        this.auth2.signOut().then(() => {
          this._isSignedInWithGoogle.next(false);
        }, (error) => {
          console.log('Google logout error: ', error)
          //could not logout of google ?
        });
      }

      if (this._isSignedInWithFb.getValue()) {
        FB.logout((response) => {
          //logged out of FB
          this._isSignedInWithFb.next(false);
        });
      }

      this.resetUser();

      this._loginStatusSource.next(false);
      this.toastService.toast(this.message, 'OK', 1000);
    });
  }

  public loginSuccess(entry: string): void {
    this.message = "Logged in";
    this.ngZone.run(() => {
      if (entry == 'fb') {
        this._isSignedInWithFb.next(true);
        this.message = "Logged in as " + this.user.fb.name;
      } else if (entry == 'google') {
        this._isSignedInWithGoogle.next(true);
        this.message = "Logged in as " + this.user.google.getBasicProfile().getName();
      }
      this._loginStatusSource.next(true);
      this.toastService.toast(this.message, 'OK', 1000);
    });
  }

  private resetUser(): void {
    this.user = {
      name: 'Guest',
      image: '',
      email: ''
    }
  }

  private createUser(): void {

  }

  constructor(private toastService: ToastService, private dialogService: DialogService, private ngZone: NgZone) {
  }

}
