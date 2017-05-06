import {Component, OnDestroy, OnInit} from "@angular/core";
import {Subscription} from "rxjs/Subscription";

import {LoginService} from "../../services/login.service";
import {RetroService} from "../../services/retro.service";

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit, OnDestroy {
  loginStatus: boolean;
  loginStatusText: string = "Login";
  loginSubscription: Subscription;

  constructor(private loginService: LoginService, private retroService: RetroService) {
  }

  private changeLoginStatus(): void {
    this.loginService.changeLoginStatus(!this.loginStatus);
  }

  private toggleCart() {
    this.retroService.toggleCart();
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

  ngOnDestroy(): void {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }
}
