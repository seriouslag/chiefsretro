import {Component, OnDestroy, OnInit} from "@angular/core";

import "rxjs/operator/finally";
import {NavigationEnd, Router} from "@angular/router";
import {AnalyticsService} from "./services/analytics.service";
import {Subscription} from "rxjs/Subscription";
import {RetroService} from "./services/retro.service";

@Component({
  selector: 'app-chiefsretro',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  isSearch: boolean = false;
  showSideNav: boolean = false;
  showCart: boolean = false;

  routerSubscription: Subscription;
  retroSubscription: Subscription;

  constructor(public router: Router, analyticsService: AnalyticsService, retroService: RetroService) {
    this.retroSubscription = retroService._showCart.subscribe(showCart => {
      this.showCart = showCart;
    });

    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        analyticsService.gaEmitPageView(event.urlAfterRedirects);
      }
    });
  }

  ngOnInit() : void {

  };

  ngOnDestroy() : void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.retroSubscription) {
      this.routerSubscription.unsubscribe();
    }
  };

}
