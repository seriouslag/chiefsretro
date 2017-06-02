import {AfterViewChecked, Component, OnDestroy, OnInit} from "@angular/core";

import "rxjs/operator/finally";
import {NavigationEnd, Router} from "@angular/router";
import {AnalyticsService} from "./services/analytics.service";
import {Subscription} from "rxjs/Subscription";
import {RetroService} from "./services/retro.service";
import {NotificationService} from "./services/notification.service";
import {AdminService} from "./services/admin.service";

@Component({
  selector: 'app-chiefsretro',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [],
})
export class AppComponent implements OnInit, OnDestroy, AfterViewChecked {

  showCart = false;
  showAdmin = false;

  private routerSubscription: Subscription;
  private showCartSubscription: Subscription;
  private showAdminSubscription: Subscription;

  constructor(public router: Router, private analyticsService: AnalyticsService, private retroService: RetroService,
              private notificationService: NotificationService, private adminService: AdminService) {
  }

  ngOnInit(): void {
    this.showCartSubscription = this.retroService.showCart.subscribe(showCart => {
      this.showCart = showCart;
    });

    this.showAdminSubscription = this.retroService.showAdmin.subscribe(showAdmin => {
      this.showAdmin = showAdmin;
    });

    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.analyticsService.gaEmitPageView(event.urlAfterRedirects);
      }
    });

    this.notificationService.setMessage(
      'Chiefsretro.com is in Alpha state and will be experiencing changes to functionality and appearance.');
  };

  ngAfterViewChecked(): void {
    // Feature detects Navigation Timing API support.
    if (window.performance) {
      // Gets the number of milliseconds since page load
      // (and rounds the result since the value must be an integer).
      const timeSincePageLoad = Math.round(performance.now());

      // Sends the timing hit to Google Analytics.
      this.analyticsService.gaEmitTiming('Home Page load', 'load', timeSincePageLoad);
    }
  }

  ngOnDestroy(): void {
    if (this.showAdmin) {
      this.showAdminSubscription.unsubscribe();
    }
    if (this.showCartSubscription) {
      this.routerSubscription.unsubscribe();
    }
  };

}
