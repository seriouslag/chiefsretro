import {Component, OnDestroy, OnInit} from '@angular/core';
import { LoginService } from '../../services/login-service';
import { Subscription } from "rxjs/Subscription";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  constructor(private loginService: LoginService) {}
  loginStatus:boolean;
  subscription:Subscription;


  login() {
    //request login with server on return true then
    this.loginService.changeLoginStatus(true);
    //else display an error
  };

  logout() {
    //request logout with the server on return true then
    this.loginService.changeLoginStatus(false);
    // else clear local login token
  };


  ngOnInit() {
    this.subscription = this.loginService.loginStatus$.subscribe(loginStatus => this.loginStatus = loginStatus);
  };

  ngOnDestroy() {
    this.subscription.unsubscribe();
  };

}
