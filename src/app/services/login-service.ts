import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ToastService} from "./toast.service";

@Injectable()
export class LoginService {

  // Observable item source
  private _loginStatusSource = new BehaviorSubject<boolean>(false);
  private message: string;
  // Observable item stream
  loginStatus$ = this._loginStatusSource.asObservable();

  // service command

  changeLoginStatus(boolean) {
    this._loginStatusSource.next(boolean);

    if (boolean) {
      this.message = "Logged in";
    } else {
      this.message = "Logged Out";
    }
    this.toastService.toast(this.message, 'OK', 1000);

  }

  constructor(private toastService: ToastService) {
  }

}
