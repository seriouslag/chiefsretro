import {Component, OnDestroy, OnInit} from "@angular/core";
import {LoginService} from "./services/login.service";
import {ProductService} from "./services/product.service";
import {ToastService} from "./services/toast.service";

import "rxjs/operator/finally";
import {DialogService} from "./services/dialog.service";
import {NavigationEnd, Router} from "@angular/router";
import {AnalyticsService} from "./services/analytics.service";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'app-chiefsretro',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [LoginService, ProductService, ToastService, DialogService, AnalyticsService],
})
export class AppComponent implements OnInit, OnDestroy {

  isSearch: boolean = false;
  showSideNav: boolean = false;

  routerSubscription: Subscription;

  constructor(public router: Router, analyticsService: AnalyticsService, loginService: LoginService) {


    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        analyticsService.gaEmitPageView(event.urlAfterRedirects);
      }
    });
  }

  ngOnInit() : void {

  };

  ngOnDestroy() : void {
    this.routerSubscription.unsubscribe();
  };

}
