import {Injectable, NgZone} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ToastService} from "./toast.service";
import {DialogService} from "./dialog.service";
import {LoginComponent} from "../components/dialogs/login/login.component";
import {MdDialogConfig} from "@angular/material";
import {LogoutComponent} from "../components/dialogs/logout/logout.component";

declare const gapi: any;



@Injectable()
export class LoginService {
  // Observable item source
  private _loginStatusSource = new BehaviorSubject<boolean>(false);
  private message: string;
  // Observable item stream
  loginStatus$ = this._loginStatusSource.asObservable();
  // service command

  isSignedInWithGoogle: boolean = false;

  user: any;

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
          //my login api
          this.loginSuccess();

        } else {
          this.loginCanceled();
        }
      });
    } else {
      //do log out;
      let logoutDialog = this.dialogService.openDialog(LogoutComponent, new MdDialogConfig());
      logoutDialog.afterClosed().subscribe(logoutResult => {
        if (logoutResult) {
          if (this.isSignedInWithGoogle) {
            this.auth2.signOut().then(() => {
              this.isSignedInWithGoogle = false;
              console.log("Signed out of google");
              /*
               TODO reset user
               */
              this.logOut();
            }, (error) => {
              console.log(error)
            })
          } else {
            //non google logout
            this.logOut();
          }
        } else {
          //canceled loggin out
        }
      });
    }
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
          this.user = this.auth2.currentUser.get();
          if (this.user.isSignedIn()) {
            this.isSignedInWithGoogle = true;
            this.loginSuccess();
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
      this._loginStatusSource.next(false);
      this.toastService.toast(this.message, 'OK', 1000);
    });
  }

  public loginSuccess(): void {
    this.message = "Logged in";
    this.ngZone.run(() => {
      this._loginStatusSource.next(true);
      this.toastService.toast(this.message, 'OK', 1000);
    });
  }

  constructor(private toastService: ToastService, private dialogService: DialogService, private ngZone: NgZone) {
  }

}
