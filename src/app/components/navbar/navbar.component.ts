import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {LoginService} from "../../services/login.service";
import {Subscription} from "rxjs/Subscription";
import {RetroService} from "../../services/retro.service";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  loginStatus: boolean;
  loginStatusText: string = "Login";
  loginSubscription: Subscription;

  @Input()
  showText: boolean = false;

  constructor(private loginService: LoginService, private retroService: RetroService) {
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

  private changeLoginStatus(): void {
    this.loginService.changeLoginStatus(!this.loginStatus);
  }

  private toggleCart() {
    if (location.pathname != '/checkout') {
      this.retroService.toggleCart();
    }
  }

}
