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
  };

  ngOnDestroy() {
    if (this.action == false) {
      this.loginDialog.close('canceled');
    }
  }


  firebaseGoogleLogin(): void {
    this.loginService.firebaseGoogleLogin();
  }

  firebaseFacebookLogin(): void {
    this.loginService.firebaseFacebookLogin();
  }

  firebaseTwitterLogin(): void {
    this.loginService.firebaseTwitterLogin();
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
