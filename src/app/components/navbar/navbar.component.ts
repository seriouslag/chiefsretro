import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {LoginService} from "../../services/login.service";
import {Subscription} from "rxjs/Subscription";
import {RetroService} from "../../services/retro.service";
import {UserService} from "../../services/user.service";
import {User} from "../../interfaces/user";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  loginStatus: boolean;
  loginStatusText: string = "Login";
  private loginSubscription: Subscription;

  private userSubscription: Subscription;
  private user: User;

  @Input()
  showText: boolean = false;

  constructor(private loginService: LoginService, private retroService: RetroService, private userService: UserService) {
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

    this.userSubscription = this.userService.user.subscribe(user => {
      this.user = user;
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
