import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Injectable()
export class LoginService {

  // Observable item source
  private _loginStatusSource = new BehaviorSubject<boolean>(false);

  // Observable item stream
  loginStatus$ = this._loginStatusSource.asObservable();

  // service command

  changeLoginStatus(boolean) {
    this._loginStatusSource.next(boolean);
  }

  constructor() { }

}
