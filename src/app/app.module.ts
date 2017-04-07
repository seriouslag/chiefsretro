import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";

import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {MaterialModule} from "@angular/material";
import {FlexLayoutModule} from "@angular/flex-layout";

import "hammerjs";

import {AppComponent} from "./app.component";
import {HomeTemplateComponent} from "./pages/home-template/home-template.component";
import {AboutComponent} from "./pages/about/about.component";
import {LoginComponent} from "./components/login/login.component";
import {ProductTemplateComponent} from "./pages/product-template/product-template.component";
import {routing} from "./app.route";
import {SearchComponent} from "./components/search/search.component";
import {CommonModule} from "@angular/common";
import {OptionsComponent} from "./components/product/product-options/product-options.component";
import {ProductComponent} from "./components/product/product/product.component";

@NgModule({
  declarations: [
    AppComponent,
    HomeTemplateComponent,
    AboutComponent,
    LoginComponent,
    ProductTemplateComponent,
    SearchComponent,
    OptionsComponent,
    ProductComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    HttpModule,
    MaterialModule,
    routing,
    FlexLayoutModule,

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
