import {Component, OnDestroy, OnInit} from "@angular/core";

import "rxjs/operator/finally";
import {NavigationEnd, Router} from "@angular/router";
import {AnalyticsService} from "./services/analytics.service";
import {Subscription} from "rxjs/Subscription";
import {RetroService} from "./services/retro.service";
import {LoginService} from "./services/login.service";
import {UserService} from "./services/user.service";

@Component({
  selector: 'app-chiefsretro',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: []
})
export class AppComponent implements OnInit, OnDestroy {

  showCart: boolean = false;
  routerSubscription: Subscription;
  showCartSubscription: Subscription;

  constructor(public router: Router, private analyticsService: AnalyticsService, private retroService: RetroService, private userService: UserService, private loginService: LoginService) {
  }

  ngOnInit(): void {
    this.userService.init().then(() => {
      this.loginService.init();
    }).catch(() => console.log('failed to call login service'));

    this.showCartSubscription = this.retroService.showCart.subscribe(showCart => {
      this.showCart = showCart;
    });

    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.analyticsService.gaEmitPageView(event.urlAfterRedirects);
      }
    });
  };

  ngOnDestroy() : void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.showCartSubscription) {
      this.routerSubscription.unsubscribe();
    }
  };

}
