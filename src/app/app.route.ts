import {RouterModule, Routes} from "@angular/router";
import {AboutComponent} from "./pages/about/about.component";
import {HomeTemplateComponent} from "./pages/home-template/home-template.component";
import {ProductTemplateComponent} from "./pages/product-template/product-template.component";
import {AllComponent} from "./pages/all/all.component";

export const appRoutes: Routes = [
  {path: 'all', component: AllComponent},
  { path: 'home', component: HomeTemplateComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'about', component: AboutComponent },
  { path: 'product/:productId',component: ProductTemplateComponent},
  { path: "**", redirectTo: '/home' }

];

export const appRoutingProviders: any[] = [

];

export const routing = RouterModule.forRoot(appRoutes);


