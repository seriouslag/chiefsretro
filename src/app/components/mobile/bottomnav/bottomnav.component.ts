import {Component, OnDestroy, OnInit} from "@angular/core";
import {Subscription} from "rxjs/Subscription";
import {LoginService} from "../../../services/login.service";

@Component({
  selector: 'app-bottomnav',
  templateUrl: './bottomnav.component.html',
  styleUrls: ['./bottomnav.component.css']
})
export class BottomnavComponent implements OnInit, OnDestroy {
  loginStatus: boolean;
  loginStatusText: string = "Login";
  loginSubscription: Subscription;

  constructor(private loginService: LoginService) {
  }

  ngOnInit() {
    this.loginSubscription = this.loginService.loginStatus$.subscribe(loginStatus => {
      this.loginStatus = loginStatus;
      if (this.loginStatus) {
        this.loginStatusText = "Logout";
      } else {
        this.loginStatusText = "Login";
      }
    });
  }

  changeLoginStatus(): void {
    this.loginService.changeLoginStatus(!this.loginStatus);
  }

  ngOnDestroy(): void {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();

    }
  }
}
