import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import 'hammerjs';

import { AppComponent } from './app.component';
import { HomeTemplateComponent } from './pages/home-template/home-template.component';
import { AboutComponent } from './pages/about/about.component';
import { LoginComponent } from './components/login/login.component';
import { ProductTemplateComponent } from './pages/product-template/product-template.component';
import { appRoutes } from './app.route';
import { SearchComponent } from './components/search/search.component';
import {CommonModule} from "@angular/common";

@NgModule({
  declarations: [
    AppComponent,
    HomeTemplateComponent,
    AboutComponent,
    LoginComponent,
    ProductTemplateComponent,
    SearchComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    HttpModule,
    MaterialModule,
    RouterModule.forRoot(appRoutes),
    FlexLayoutModule,

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
