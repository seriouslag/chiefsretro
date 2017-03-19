import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable()
export class LoginService {

  //look into behaviorSubjects

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
