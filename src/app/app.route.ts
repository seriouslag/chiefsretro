import {RouterModule, Routes} from "@angular/router";
import {AboutPageComponent} from "./pages/about/about.page.component";
import {HomePageComponent} from "./pages/home/home.page.component";
import {ProductPageComponent} from "./pages/product/product.page.component";
import {AllComponent} from "./pages/all/all.component";
import {CheckoutPageComponent} from "./pages/checkout/checkout.page.component";
import {StatusPageComponent} from "./pages/status/status.page.component";
import {AccountPageComponent} from "./pages/account/account.page.component";
import {Four04Component} from "./pages/four04/four04.component";
import {AdminPageComponent} from "./pages/admin/admin.page.component";

export const appRoutes: Routes = [
  {path: 'all', component: AllComponent},
  {path: 'home', component: HomePageComponent},
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {path: 'about', component: AboutPageComponent},
  {path: 'product/:productId', component: ProductPageComponent},
  {path: 'checkout', component: CheckoutPageComponent},
  {path: 'status/:orderId', component: StatusPageComponent},
  {path: 'status/:orderId/:custId', component: StatusPageComponent},
  {path: 'account', component: AccountPageComponent},
  {path: 'admin', component: AdminPageComponent},
  {path: '**', component: Four04Component}
];

export const routing = RouterModule.forRoot(appRoutes);


