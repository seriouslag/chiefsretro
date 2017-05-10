import {Injectable} from "@angular/core";
import {MdSnackBar} from "@angular/material";
import {LoginToastComponent} from "../components/toasts/login/login.toast.component";

@Injectable()
export class ToastService {

  constructor(private snackbar: MdSnackBar) {
  }

  toast(text: string, button?: string, duration?: number) {
    if (!button) {
      button = 'OK';
    }
    if (!duration) {
      duration = 1000;
    }
    this.snackbar.open(text, button, {
      duration: duration,
      extraClasses: true ? ['accent-backgroundColor'] : null
    })
  }

  loginToast(profileUrl: string, message: string, duration: number) {
    let login = this.snackbar.openFromComponent(LoginToastComponent, {
      duration: duration,
      extraClasses: true ? ['accent-backgroundColor'] : null
    });

    login.instance.profileUrl = profileUrl;
    login.instance.loginMessage = message;
  }
}
