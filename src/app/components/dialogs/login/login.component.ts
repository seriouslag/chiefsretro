import {Component, OnDestroy, OnInit} from "@angular/core";
import {MdDialogRef} from "@angular/material";
import {LoginService} from "../../../services/login.service";


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: []
})

export class LoginComponent implements OnInit, OnDestroy {

  loginService: LoginService;
  showLoginText: boolean;
  action: boolean;

  constructor(public loginDialog: MdDialogRef<LoginComponent>) {
  }

  ngOnInit() {

    this.showLoginText = this.loginDialog.componentInstance.showLoginText;

    setTimeout(() => {
      console.log(this.loginService.isGoogleInit);
      if (this.loginService.isGoogleInit) {
        this.loginService.attachGoogleSignin(document.getElementById("my-signin2"));
      }
    }, 100);


  };

  ngOnDestroy() {
    if (this.action == false) {
      this.loginDialog.close('canceled');
    }
  }

  googleLogin(): void {
    this.action = true;
    /*if(this.loginService.auth2) {
     this.loginService.auth2.signIn().then(() => {
     this.loginService.googleLogin();
     });
     } else {
     this.loginDialog.close('google');
     }*/

    //now handled by googles attachClickListener
  }

  fbLogin(): void {
    if (this.loginService.isFbInit) {
      this.loginService.fbLogin();
    } else {
      this.loginDialog.close('fb');
    }
    this.action = true;
  }


  defaultLogin(): void {
    this.action = true;
    this.loginDialog.close('default');
  }

  cancel(): void {
    this.action = true;
    this.loginDialog.close('canceled');
  }
}
