import {Injectable} from "@angular/core";
import {MdSnackBar} from "@angular/material";
import {LoginToastComponent} from "../components/toasts/login/login.toast.component";

@Injectable()
export class ToastService {

  constructor(private snackbar: MdSnackBar) {
  }

  toast(text: string, button: string, length: number) {
    this.snackbar.open(text, button, {
      duration: length,
    })
  }

  loginToast(profileUrl: string, message: string, length: number) {
    let login = this.snackbar.openFromComponent(LoginToastComponent, {
      duration: length,
    });

    login.instance.profileUrl = profileUrl;
    login.instance.loginMessage = message;
  }



}
