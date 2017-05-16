import {RouterModule, Routes} from "@angular/router";
import {AboutPageComponent} from "./pages/about/about.page.component";
import {HomePageComponent} from "./pages/home/home.page.component";
import {ProductPageComponent} from "./pages/product/product.page.component";
import {AllComponent} from "./pages/all/all.component";
import {CheckoutPageComponent} from "./pages/checkout/checkout.page.component";
import {animate, style, transition, trigger} from "@angular/animations";

export const appRoutes: Routes = [
  {path: 'all', component: AllComponent},
  {path: 'home', component: HomePageComponent},
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {path: 'about', component: AboutPageComponent},
  {path: 'product/:productId', component: ProductPageComponent},
  {path: 'checkout', component: CheckoutPageComponent},
  { path: "**", redirectTo: '/home' }
];

export const fadeInAnimation =
  trigger('fadeInAnimation', [
  // route 'enter' transition
    transition(':enter', [

      // styles at start of transition
      style({opacity: 0}),

      // animation and styles at end of transition
      animate('.3s', style({opacity: 1}))
    ]),
    transition(':leave', [
      style({opacity: 1}),
      animate('.3s', style({opacity: 0}))
    ])
]);

export const routing = RouterModule.forRoot(appRoutes);


