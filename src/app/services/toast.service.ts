import {Injectable} from "@angular/core";
import {MdSnackBar} from "@angular/material";
import {LoginToastComponent} from "../components/toasts/login/login.toast.component";

@Injectable()
export class ToastService {

  toastDuration = 1500;

  constructor(private snackbar: MdSnackBar) {
  }

  toast(text: string, button?: string, duration?: number) {
    if (!button) {
      button = 'OK';
    }
    if (!duration) {
      duration = this.toastDuration;
    }
    this.snackbar.open(text, button, {
      duration: duration,
      extraClasses: ['accent-backgroundColor']
    })
  }

  loginToast(profileUrl: string, message: string, duration?: number) {
    if (!duration) {
      duration = this.toastDuration;
    }

    if (profileUrl) {
      const login = this.snackbar.openFromComponent(LoginToastComponent, {
        duration: duration,
        extraClasses: ['accent-backgroundColor']
      });

      login.instance.profileUrl = profileUrl;
      login.instance.loginMessage = message;
    } else {
      this.snackbar.open(message, 'OK', {
        duration: duration,
        extraClasses: ['accent-backgroundColor']
      })
    }

  }
}
