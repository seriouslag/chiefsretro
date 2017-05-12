import {BrowserModule, HAMMER_GESTURE_CONFIG, HammerGestureConfig} from "@angular/platform-browser";

import {NgModule} from "@angular/core";

import {FormsModule} from "@angular/forms";
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
import {HomeTemplateComponent} from "./pages/home-template/home-template.component";
import {AboutComponent} from "./pages/about/about.component";
import {LoginComponent} from "./components/dialogs/login/login.component";
import {ProductTemplateComponent} from "./pages/product-template/product-template.component";
import {routing} from "./app.route";
import {SearchComponent} from "./components/search/search.component";
import {CommonModule} from "@angular/common";
import {ProductComponent} from "./components/product/product/product.component";
import {FooterComponent} from "./components/footer/footer.component";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {SidenavComponent} from "./components/sidenav/sidenav.component";
import {AutosearchComponent} from "./components/autosearch/autosearch.component";
import {BottomnavComponent} from "./components/mobile/bottomnav/bottomnav.component";
import {AllComponent} from "./pages/all/all.component";
import {ThumbImageComponent} from "./components/images/thumb-image/thumb-image.component";
import {ProductImagesComponent} from "./components/images/product-images/product-images.component";
import {LogoutComponent} from "./components/dialogs/logout/logout.component";
import {LoginToastComponent} from "./components/toasts/login/login.toast.component";
import {LoginService} from "./services/login.service";
import {UserService} from "./services/user.service";
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
import {CheckoutComponent} from "./pages/checkout/checkout.component";
import {NavbarComponent} from "./components/navbar/navbar.component";


import * as Hammer from "hammerjs";
import {AngularFireModule} from "angularfire2";
import {AngularFireAuth} from "angularfire2/auth";
export class HammerConfig extends HammerGestureConfig {
  overrides = <any> {
    'pinch': {enable: false},
    'rotate': {enable: false},
    'pan': {enable: false},
    'swipe': {direction: Hammer.DIRECTION_HORIZONTAL, enable: true, domEvents: true}
  }
}
export const firebaseConfig = {
  apiKey: "AIzaSyDAUp0tRd48ur-IRD4Bw4AJQ7OoslW355I",
  authDomain: "chiefsretro-163916.firebaseapp.com",
  databaseURL: "https://chiefsretro-163916.firebaseio.com",
  projectId: "chiefsretro-163916",
  storageBucket: "chiefsretro-163916.appspot.com",
  messagingSenderId: "917853947579"
};

@NgModule({
  declarations: [
    AppComponent,
    HomeTemplateComponent,
    AboutComponent,
    LoginComponent,
    ProductTemplateComponent,
    SearchComponent,
    ProductComponent,
    FooterComponent,
    SidenavComponent,
    AutosearchComponent,
    BottomnavComponent,
    AllComponent,
    ThumbImageComponent,
    ProductImagesComponent,
    LogoutComponent,
    LoginToastComponent,
    FloatingcartComponent,
    CancelComponent,
    NotificationbarComponent,
    ToolbarComponent,
    CheckoutComponent,
    NavbarComponent,
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
    routing,
    FlexLayoutModule,
    AngularFireModule.initializeApp(firebaseConfig)
  ],
  providers: [LoginService, UserService, ProductService, ToastService, DialogService, AnalyticsService, RetroService, NotificationService, {
    provide: HAMMER_GESTURE_CONFIG,
    useClass: HammerConfig
  }, AngularFireAuth],
  entryComponents: [LoginComponent, LogoutComponent, LoginToastComponent, CancelComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
}
