import {Component, OnDestroy, OnInit} from "@angular/core";
import {MdDialogRef} from "@angular/material";


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit, OnDestroy {

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

  googleLogin(): void {
    this.action = true;
    this.loginDialog.close('google');

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
