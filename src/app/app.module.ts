import {BrowserModule, HAMMER_GESTURE_CONFIG, HammerGestureConfig} from "@angular/platform-browser";

import {NgModule} from "@angular/core";

import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {
  MdAutocompleteModule,
  MdButtonModule,
  MdButtonToggleModule,
  MdCardModule,
  MdCheckboxModule,
  MdChipsModule,
  MdCoreModule,
  MdDialogModule,
  MdIconModule,
  MdInputModule,
  MdLineModule,
  MdListModule,
  MdMenuModule,
  MdOptionModule,
  MdProgressBarModule,
  MdProgressSpinnerModule,
  MdRadioModule,
  MdRippleModule,
  MdSelectionModule,
  MdSelectModule,
  MdSidenavModule,
  MdSliderModule,
  MdSlideToggleModule,
  MdSnackBarModule,
  MdTabsModule,
  MdToolbarModule,
  MdTooltipModule
} from "@angular/material";
import {FlexLayoutModule} from "@angular/flex-layout";

import "hammerjs";

import {AppComponent} from "./app.component";
import {HomePageComponent} from "./pages/home/home.page.component";
import {AboutPageComponent} from "./pages/about/about.page.component";
import {LoginComponent} from "./components/dialogs/login/login.component";
import {ProductPageComponent} from "./pages/product/product.page.component";
import {routing} from "./app.route";
import {CommonModule} from "@angular/common";
import {ProductComponent} from "./components/product/product/product.component";
import {FooterComponent} from "./components/footer/footer.component";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {AutosearchComponent} from "./components/autosearch/autosearch.component";
import {AllComponent} from "./pages/all/all.component";
import {ThumbImageComponent} from "./components/images/thumb-image/thumb-image.component";
import {ProductImagesComponent} from "./components/images/product-images/product-images.component";
import {LogoutComponent} from "./components/dialogs/logout/logout.component";
import {LoginToastComponent} from "./components/toasts/login/login.toast.component";
import {ProductService} from "./services/product.service";
import {ToastService} from "./services/toast.service";
import {DialogService} from "./services/dialog.service";
import {AnalyticsService} from "./services/analytics.service";
import {FloatingcartComponent} from "./components/floatingcart/floatingcart.component";
import {RetroService} from "./services/retro.service";
import {CancelComponent} from "./components/dialogs/cancel/cancel.component";
import {NotificationbarComponent} from "./components/notificationbar/notificationbar.component";
import {ToolbarComponent} from "./components/toolbar/toolbar.component";
import {NotificationService} from "./services/notification.service";
import {CheckoutPageComponent} from "./pages/checkout/checkout.page.component";
import {NavbarComponent} from "./components/navbar/navbar.component";

import * as Hammer from "hammerjs";
import {firebaseAdminApp, firebaseApp} from "./app.firebase";
import {AngularFireAuth, AngularFireAuthModule} from "angularfire2/auth";
import {AngularFireDatabaseModule} from "angularfire2/database";
import {FirebaseService} from "./services/firebase.service";
import {StatusPageComponent} from "./pages/status/status.page.component";
import {AccountPageComponent} from "./pages/account/account.page.component";
import {Four04Component} from "./pages/four04/four04.component";
import {AdminPageComponent} from "./pages/admin/admin.page.component";
import {AdminLoginComponent} from "./components/dialogs/admin-login/admin-login.component";
import {AdminService} from "./services/admin.service";
import {ToolbarAdminComponent} from "./components/admin/toolbar-admin/toolbar-admin.component";

export class HammerConfig extends HammerGestureConfig {
  overrides = <any> {
    'pinch': {enable: false},
    'rotate': {enable: false},
    'pan': {enable: false},
    'swipe': {direction: Hammer.DIRECTION_HORIZONTAL, enable: true, domEvents: true}
  }
}

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    AboutPageComponent,
    LoginComponent,
    ProductPageComponent,
    ProductComponent,
    FooterComponent,
    AutosearchComponent,
    AllComponent,
    ThumbImageComponent,
    ProductImagesComponent,
    LogoutComponent,
    LoginToastComponent,
    FloatingcartComponent,
    CancelComponent,
    NotificationbarComponent,
    ToolbarComponent,
    CheckoutPageComponent,
    NavbarComponent,
    StatusPageComponent,
    AccountPageComponent,
    Four04Component,
    AdminPageComponent,
    AdminLoginComponent,
    ToolbarAdminComponent,

  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    CommonModule,
    HttpModule,
    MdButtonModule, MdMenuModule, MdToolbarModule, MdInputModule, MdSidenavModule, MdIconModule, MdTabsModule,
    MdChipsModule, MdTooltipModule, MdCardModule, MdCheckboxModule, MdCoreModule, MdDialogModule,
    MdOptionModule, MdLineModule, MdListModule, MdProgressBarModule, MdProgressSpinnerModule, MdAutocompleteModule,
    MdButtonToggleModule, MdRadioModule, MdRippleModule, MdSelectionModule, MdSelectModule, MdSliderModule,
    MdSlideToggleModule, MdSnackBarModule,
    FlexLayoutModule,
    routing,
    firebaseAdminApp,
    firebaseApp,

    AngularFireAuthModule,
    AngularFireDatabaseModule,
    ReactiveFormsModule,
  ],
  exports: [FormsModule, ReactiveFormsModule],
  providers: [ProductService, ToastService, DialogService, AnalyticsService, RetroService, NotificationService, {
    provide: HAMMER_GESTURE_CONFIG,
    useClass: HammerConfig
  }, AngularFireAuth, FirebaseService, AdminService],
  entryComponents: [LoginComponent, LogoutComponent, LoginToastComponent, CancelComponent, AdminLoginComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
}
