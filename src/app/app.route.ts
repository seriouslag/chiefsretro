import {RouterModule, Routes} from "@angular/router";
import {AboutComponent} from "./pages/about/about.component";
import {HomeTemplateComponent} from "./pages/home-template/home-template.component";
import {ProductTemplateComponent} from "./pages/product-template/product-template.component";
import {AllComponent} from "./pages/all/all.component";
import {CheckoutComponent} from "./pages/checkout/checkout.component";
import {animate, style, transition, trigger} from "@angular/animations";

export const appRoutes: Routes = [
  {path: 'all', component: AllComponent},
  { path: 'home', component: HomeTemplateComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'about', component: AboutComponent },
  {path: 'product/:productId', component: ProductTemplateComponent},
  {path: 'checkout', component: CheckoutComponent},
  { path: "**", redirectTo: '/home' }
];

export const fadeInAnimation = trigger('fadeInAnimation', [
  // route 'enter' transition
  transition(':enter', [

    // styles at start of transition
    style({opacity: 0}),

    // animation and styles at end of transition
    animate('.3s', style({opacity: 1}))
  ]),
]);

export const routing = RouterModule.forRoot(appRoutes);


