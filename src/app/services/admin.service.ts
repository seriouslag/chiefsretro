import {Injectable} from "@angular/core";
import {Subscription} from "rxjs/Subscription";
import {MdDialogConfig, MdDialogRef} from "@angular/material";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {AngularFireAuth} from "angularfire2/auth";
import {AngularFireDatabase} from "angularfire2/database";
import * as firebase from "firebase/app";
import {User} from "firebase/app";
import {ToastService} from "./toast.service";
import {LogoutComponent} from "../components/dialogs/logout/logout.component";
import {AdminLoginComponent} from "../components/dialogs/admin-login/admin-login.component";
import {DialogService} from "./dialog.service";
import {firebaseAdminConfig} from "../app.firebase";
import {Observable} from "rxjs/Observable";
import {RetroService} from "./retro.service";
@Injectable()
export class AdminService {

  public _signedIn = new BehaviorSubject<boolean>(false);
  public signedIn = this._signedIn.asObservable();
  public _admin = new BehaviorSubject<User>(null);
  public admin = this._admin.asObservable();
  private loggedInSubscription: Subscription;
  private loginDialog: MdDialogRef<AdminLoginComponent>;


  private appAdmin: firebase.app.App;

  constructor(private af: AngularFireAuth, private db: AngularFireDatabase, private toastService: ToastService, private dialogService: DialogService, private retroService: RetroService) {


    this.appAdmin = firebase.initializeApp(firebaseAdminConfig, "firebaseAdminApp");

    this.loggedInSubscription =
      Observable.create(this.appAdmin.auth().onAuthStateChanged(admin => {
        console.log('admin2', admin);
        this._admin.next(admin);

        if (admin == null) {
          //not logged in or logging out
          sessionStorage.setItem('admin', 'false');
          //not logged in
          if (this._signedIn.getValue()) {
            //if was logged in then show logout message
            this.showLogout();
          } else {


          }
        } else {
          //logged in or logging in
          if (this.loginDialog) {
            this.loginDialog.close();
          }

          if (sessionStorage.getItem('admin') == 'true') {
            this.silentLogin();
          } else {
            this.showLogin();
          }

          this._signedIn.next(true);
        }
      }));
  }

  public changeLoginStatus(boolean) {
    if (this.loginDialog) {
      this.loginDialog.close('force');
    }
    if (boolean) {
      this.loginDialog = this.dialogService.openDialog(AdminLoginComponent, {
        disableClose: true,

      });
      this.loginDialog.componentInstance.adminService = this;
      this.loginDialog.afterClosed().subscribe(loginResult => {
        setTimeout(() => {
          if (this._signedIn.getValue() == false) {
            if (loginResult == 'force') {
              //do nothing
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
          //if a sub is added.
          console.log('should log out');
          this.appAdmin.auth().signOut();
          this.retroService.setAdmin(false);
        } else {
          //canceled logout
        }
      });
    }
  }

  public firebaseEmailLogin(email: string, password: string): Promise<string> {
    return new Promise((resolve => {
      this.appAdmin.auth().signInWithEmailAndPassword(email, password).then(response => {
        resolve('ok');
        //should be handled by event handler
      }).catch((error: any) => {
        let errorCode = error.code;
        let errorMessage = error.message;
        this.toast(errorMessage);
        if (errorCode == 'auth/user-disabled') {
        } else if (errorCode == 'auth/invalid-email') {
        } else if (errorCode == 'auth/user-not-found') {
        } else if (errorCode == 'auth/wrong-password') {
        } else {
          console.log('An unknown error occured', error);
        }
        resolve(errorCode);
      });
    }));
  }

  private silentLogin(): void {
    if (this.loginDialog) {
      this.loginDialog.close('force');
    }
    //do nothing; handled by auth subscription
  }

  private showLogin(): void {
    //close dialog if you get to this point
    if (this.loginDialog) {
      this.loginDialog.close('force');
    }

    let message: string;
    if (this._admin.getValue().displayName) {
      message = "Logged in as " + this._admin.getValue().displayName;
    } else {
      message = "Logged in as " + this._admin.getValue().email;
    }
    this.toastService.loginToast(this._admin.getValue().photoURL, message, this.toastService.toastDuration);
  }

  private showLoginFailed() {
    let message = "Login Failed";
    this.toast(message);
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

  private showLogout(): void {
    let message = "Logged out";
    this.toast(message);
  }

}
