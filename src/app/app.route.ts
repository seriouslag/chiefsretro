import {RouterModule, Routes} from "@angular/router";
import {AboutComponent} from "./pages/about/about.component";
import {HomeTemplateComponent} from "./pages/home-template/home-template.component";
import {ProductTemplateComponent} from "./pages/product-template/product-template.component";
import {AllComponent} from "./pages/all/all.component";
import {CheckoutComponent} from "./pages/checkout/checkout.component";

export const appRoutes: Routes = [
  {path: 'all', component: AllComponent},
  { path: 'home', component: HomeTemplateComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'about', component: AboutComponent },
  { path: 'product/:productId',component: ProductTemplateComponent},
  {path: 'checkout', component: CheckoutComponent},
  { path: "**", redirectTo: '/home' }

];


export const routing = RouterModule.forRoot(appRoutes);


