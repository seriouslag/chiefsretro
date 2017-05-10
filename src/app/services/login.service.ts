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
  private loginDialog: MdDialogRef<any>;
  private userSubscription: Subscription;
  private toastLength = 1500;

  isFbInit: boolean = false;
  isGoogleInit: boolean = false;
  user: User;
  retry: number = 0;
  auth2: any;

  public init(): void {
    this.userSubscription = this.userService.user.subscribe(user => {
      this.user = user;
    });


    this.googleInit();
    this.fbInit();

  }

  public changeLoginStatus(boolean) {
    if (boolean) {
      this.loginDialog = this.dialogService.openDialog(LoginComponent, new MdDialogConfig());
      this.loginDialog.componentInstance.showLoginText = true;
      this.loginDialog.componentInstance.loginService = this;
      this.loginDialog.afterClosed().subscribe(loginResult => {
        setTimeout(() => {
          if (this._loginStatusSource.getValue() == false) {
            if (loginResult == "google" && this._isSignedInWithGoogle.getValue() == false) {
              this.googleLogin();
            } else if (loginResult == "default" && this._loginStatusSource.getValue() == false) {
              //login api backend
              this.loginSuccess('default');
            } else if (loginResult == 'fb' && this._isSignedInWithFb.getValue() == false) {
              this.fbLogin();
            } else if (loginResult == 'force') {
              //do nothing
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
        if (FB != null) {
          FB.init({
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
              if (response.status === "connected") {
                //auto log in
                if (localStorage.getItem('login') != 'false') {
                  this.fbLogin();
                } else {
                  //do not log in with facebook because they requested to be signed out.
                }
              }
            }));
        } else {
          //FB is undefined
        }
      });
  }

  private loadSdkAsync(callback: () => void) {
    // Load the Facebook SDK asynchronously
    this.ngZone.run(() => {
      if (FB != null) {
        callback();
      } else {
        if (this.retry < 5) {
          console.log('FB retry');
          setTimeout(() => {
            this.fbInit();
            this.retry++;
          }, 500);
        }
      }
    });
  }

  public fbLogin() {
    if (this.isFbInit == false) {
      this.fbInit();
    } else {
      FB.getLoginStatus((response) => {
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
        this.userService.updateUser(this.user);

        FB.api("/" + response.authResponse.userID + "/picture?height=40&width=40&redirect=0", (picture) => {
          this.user.fb.img = picture.data.url;
          this.userService.updateUser(this.user);
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
      if (gapi != null) {
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
                if (this.user.google) {
                  if (this.auth2) {
                    if (this.auth2.currentUser.get()) {
                      this.silentLogin();
                      //console.log('goog already logged in previously?');
                    }
                  }
                } else {
                  this.googleLogin();
                }
              }
            });
          });
        } else {
          //gapi is undefined
        console.log('google retry');
        if (this.retry < 15) {
            setTimeout(() => {
              this.googleInit();
              this.retry++;
            }, 200);
          }
        }
      }
    );
  }

  public googleLogin() {
    this.ngZone.run(() => {
      if (this.auth2 != null && this.auth2.currentUser) {
        this.user.google = this.auth2.currentUser.get();
        this.userService.updateUser(this.user);
        if (this.user.google.isSignedIn()) {
          this.loginSuccess('google');
        }
      } else {
        if (this.isGoogleInit == false) {
          this.googleInit();
        } else {
          this.auth2.signIn().then(() => {
            this.user.google = this.auth2.currentUser.get();
            this.userService.updateUser(this.user);
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
    });
  }

  public attachGoogleSignin(element: any) {
    this.auth2.attachClickHandler(element, {}, () => {
      this.googleLogin()
    }, {})
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
      if (this._isSignedInWithGoogle.getValue()) {
        this.auth2.signOut().then(() => {
          console.log('Logged out with Google');
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
          console.log('Logged out with facebook', response);
        }, (error) => {
          console.log('Could not guarantee successful logout of facebook', error);
        });
      }

      this.userService.resetUser();

      localStorage.setItem('login', 'false');

      this._loginStatusSource.next(false);
      this.toast(this.message);
    });
  }

  private silentLogin(): void {
    if (this.loginDialog) {
      this.loginDialog.close('force');
    }
    this._loginStatusSource.next(true);
  }

  private loginSuccess(entry: string): void {
    if (this.loginDialog) {
      this.loginDialog.close('force');
    }
    this.message = "Logged in";
    this.ngZone.run(() => {

      if (entry == 'fb') {
        localStorage.setItem('login', 'true');
        this.user.email = this.user.fb.email;
        this.user.fname = this.user.fb.first_name;
        this.user.lname = this.user.fb.last_name;
        this.user.img = this.user.fb.img;
        //this.user.gender = this.user.fb.gender;
        this.userService.updateUser(this.user);
        this._isSignedInWithFb.next(true);
        this.message = "Logged in as " + this.user.fb.name;

      } else if (entry == 'google') {
        this.user.email = this.user.google.getBasicProfile().getEmail();
        this.user.fname = this.user.google.getBasicProfile().getGivenName();
        this.user.lname = this.user.google.getBasicProfile().getFamilyName();
        this.user.img = this.user.google.getBasicProfile().getImageUrl();
        this.userService.updateUser(this.user);
        this._isSignedInWithGoogle.next(true);
        this.message = "Logged in as " + this.user.google.getBasicProfile().getName();
      }
      this._loginStatusSource.next(true);
      this.toastService.loginToast(this.user.img, this.message, this.toastLength);
    });
  }


  constructor(private toastService: ToastService, private dialogService: DialogService, private ngZone: NgZone, private userService: UserService) {
  }

}
