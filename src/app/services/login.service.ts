import {Injectable, NgZone} from "@angular/core";
import {MdDialogConfig} from "@angular/material";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

import {ToastService} from "./toast.service";
import {DialogService} from "./dialog.service";

import {LoginComponent} from "../components/dialogs/login/login.component";
import {LogoutComponent} from "../components/dialogs/logout/logout.component";
import {isUndefined} from "util";

declare const gapi: any;
declare const FB: any;



@Injectable()
export class LoginService {
  // Observable item source
  private _loginStatusSource = new BehaviorSubject<boolean>(false);
  private _isSignedInWithGoogle = new BehaviorSubject<boolean>(false);
  private _isSignedInWithFb = new BehaviorSubject<boolean>(false);

  // Observable item stream
  loginStatus$ = this._loginStatusSource.asObservable();
  isSignedInWithGoogle$ = this._isSignedInWithGoogle.asObservable();
  isSignedInWithFb$ = this._isSignedInWithFb.asObservable();

  private message: string;
  private isFbInit: boolean = false;
  private isGoogleInit: boolean = false;

  user: any = {};
  retry: number = 0;

  private auth2: any;

  private init(): void {
    this.googleInit();
    this.fbInit();
  }

  public changeLoginStatus(boolean) {
    if (boolean) {
      let loginDialog = this.dialogService.openDialog(LoginComponent, new MdDialogConfig());
      loginDialog.componentInstance.showLoginText = true;
      loginDialog.afterClosed().subscribe(loginResult => {
        if (this._loginStatusSource.getValue() == false) {
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
    /*
     FOR TESTING
     */
    let appId = '';
    let location = window.location.hostname;

    if (location === "localhost") {
      //test1
      appId = '859537694185547';
    } else if (location === "seriouslag.com") {
      //test2
      appId = '859605290845454';
    } else if (location === "chiefsretro.com") {
      //main
      appId = '859536897518960';
    }

    this.loadSdkAsync(
      () => {
        if (isUndefined(FB) == false) {
          //have to set cookie and status to false else it will auto log in even if they previously logged out
          FB.init({
            //seriouslag.com
            //appId: '859605290845454',
            //localhost
            //appId: '859537694185547',
            appId: appId,
            status: true,
            cookie: true,
            xfbml: true,
            version: 'v2.9'

          });
          FB.AppEvents.logPageView();
          this.isFbInit = true;
          //if user was previously signed in via facebook, sign them in again
          FB.getLoginStatus(
            ((response) => {
              if (response && response.status === "connected") {
                console.log('going to auto login', this.isFbInit);
                this.fbLogin();
              }
              console.log('init', response);
            }));
        } else {
          //FB is undefined
        }
      });
  }

  private loadSdkAsync(callback: () => void) {
    //window.fbAsyncInit = () => this.ngZone.run(callback);
    // Load the Facebook SDK asynchronously
    this.ngZone.run(() => {
      const s = "script";
      const id = "facebook-jssdk";
      var js, fjs = document.getElementsByTagName(s)[0];
      if (document.getElementById(id)) return;
      js = document.createElement(s);
      js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    });
    if (isUndefined(FB) == false) {
      this.ngZone.run(callback);
    } else {
      if (this.retry < 5) {
        setTimeout(() => {
          this.fbInit();
          this.retry++;
        }, 500);
      }
    }
  }

  private fbLogin() {
    console.log('fbLogin', FB, this.isFbInit);
    if (this.isFbInit == false) {
      this.fbInit();
    } else {

      FB.getLoginStatus((response) => {
        console.log('should be good togo', response.status);
        if (response.status === "not_authorized") {
          FB.login((response) => {
            this.getFbProfileFromFbLoginResponse(response)
          }, {scope: 'email, public_profile'});
        } else if (response.status === "connected" && response.authResponse) {
          /*FB.login((response) => {
            this.getFbProfileFromFbLoginResponse(response)
           }, {scope: 'email, public_profile'});*/
          this.getFbProfileFromFbLoginResponse(response);
        } else {
          //unknown response trying to log in anyways
          FB.login((response) => {
            this.getFbProfileFromFbLoginResponse(response)
          }, {scope: 'email, public_profile'});
        }
      });
    }
  }

  private getFbProfileFromFbLoginResponse(response: any): void {
    //get user profile from response
    if (response.status === "connected") {
      FB.api("/" + response.authResponse.userID, (user) => {
        this.user.fb = user;
        FB.api("/" + response.authResponse.userID + "/picture?height=40&width=40&redirect=0", (picture) => {
          this.user.fb.img = picture.data.url;
          this.loginSuccess('fb');
        });
      });
    } else {
      //failed to login to fb
      this.loginFailed();
    }
  }

  private googleInit(): void {
    this.ngZone.run(() => {
        if (isUndefined(gapi) == false) {
          gapi.load('auth2', () => {
            gapi.auth2.init({
              client_id: '917853947579-aukq6soleijkjemi7ln3usavpg7l7nb1.apps.googleusercontent.com',
              cookiepolicy: 'single_host_origin',
              scope: 'profile email'
            }).then((auth2) => {
              this.auth2 = auth2;
              auth2.isSignedIn.listen((val) => {
                console.log('Signin state changed to ', val);
              });
              this.isGoogleInit = true;
              //if user was previously signed in via google, sign them in again
              if (this.auth2.isSignedIn.get() == true) {
                this.googleLogin();
              }
            });
          });
        } else {
          //gapi is undefined
          if (this.retry < 5) {
            setTimeout(() => {
              this.googleInit();
              this.retry++;
            }, 500);
          }
        }
      }
    );
  }

  private googleLogin() {
    if (this.isGoogleInit == false) {
      this.googleInit();
    } else {

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
    }
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
          FB.getLoginStatus((response) => {
            console.log(response)
          });
        });
      }

      this.resetUser();

      this._loginStatusSource.next(false);
      this.toastService.toast(this.message, 'OK', 1000);
    });
  }

  private loginSuccess(entry: string): void {
    this.message = "Logged in";
    this.ngZone.run(() => {
      if (entry == 'fb') {


        this.user.email = this.user.fb.email;
        this.user.fname = this.user.fb.first_name;
        this.user.lname = this.user.fb.last_name;
        this.user.img = this.user.fb.img;
        this.user.gender = this.user.fb.gender;

        this._isSignedInWithFb.next(true);
        this.message = "Logged in as " + this.user.fb.name;
      } else if (entry == 'google') {

        this.user.email = this.user.google.getBasicProfile().getEmail();
        this.user.fname = this.user.google.getBasicProfile().getGivenName();
        this.user.lname = this.user.google.getBasicProfile().getFamilyName();
        this.user.img = this.user.google.getBasicProfile().getImageUrl();

        this._isSignedInWithGoogle.next(true);
        this.message = "Logged in as " + this.user.google.getBasicProfile().getName();
      }
      this._loginStatusSource.next(true);
      this.toastService.loginToast(this.user.img, this.message, 1000);
    });
  }

  private resetUser(): void {
    this.user = {
      name: 'Guest',
      img: '',
      email: ''
    }
  }

  constructor(private toastService: ToastService, private dialogService: DialogService, private ngZone: NgZone) {
    this.init();
  }

}
