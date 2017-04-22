import {Component, OnDestroy, OnInit} from "@angular/core";
import {LoginService} from "../../services/login-service";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  constructor(private loginService: LoginService) {}
  loginStatus:boolean;
  loginStatusText: string = "Login";
  subscription:Subscription;

  changeLoginStat(): void {
    this.loginService.changeLoginStatus(!this.loginStatus);
  }


  ngOnInit() {
    this.subscription = this.loginService.loginStatus$.subscribe(loginStatus => {
      this.loginStatus = loginStatus;
      if (this.loginStatus) {
        this.loginStatusText = "Logout";
      } else {
        this.loginStatusText = "Login";
      }
    });
  };

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  };
}
