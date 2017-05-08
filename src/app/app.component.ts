import {Component, OnDestroy, OnInit} from "@angular/core";

import "rxjs/operator/finally";
import {NavigationEnd, Router} from "@angular/router";
import {AnalyticsService} from "./services/analytics.service";
import {Subscription} from "rxjs/Subscription";
import {RetroService} from "./services/retro.service";
import {animate, group, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-chiefsretro',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('openclose', [
      transition(':enter', [
        style({
          top: '-50%',
        }),
        animate('1s ease-in-out', style({
          top: 0,
        }))
      ]),
      transition(':leave', [
        style({
          top: 0,
        }),
        animate('1s ease-in-out', style({
          top: '-50%',
        }))
      ])
    ]),
    trigger('toolbar', [
      transition(':enter', [
        style({transform: 'translateY(-50%)'}),
        animate('0.5s ease')
      ]),
      transition(':leave', [
        group([
          animate('0.25s ease', style({
            transform: 'translateY(-50%)', position: 'inherit'
          })),
        ])
      ])
    ]),
  ]
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
