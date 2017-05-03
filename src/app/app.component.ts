import {Component, OnDestroy, OnInit} from "@angular/core";
import {LoginService} from "./services/login.service";
import {Subscription} from "rxjs";
import {ProductService} from "./services/product.service";
import {ToastService} from "./services/toast.service";
import {Product} from "./interfaces/product";

import "rxjs/operator/finally";
import {MdSnackBar} from "@angular/material";
import {DialogService} from "./services/dialog.service";


@Component({
  selector: 'app-chiefsretro',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [LoginService, ProductService, ToastService, DialogService],
})
export class AppComponent implements OnInit, OnDestroy {
  product: Product;
  loginStatus: boolean;
  loginStatusText: string = "Login";
  loginSubscription:Subscription;
  productSubscription:Subscription;

  isSearch: boolean = false;

  showSideNav: boolean = false;

  constructor(private loginService: LoginService, private toast: MdSnackBar) {
  }
  ngOnInit() : void {
    this.loginSubscription = this.loginService.loginStatus$.subscribe(loginStatus => {
      this.loginStatus = loginStatus;
      if (this.loginStatus) {
        this.loginStatusText = "Logout";
      } else {
        this.loginStatusText = "Login";
      }
    });
  };

  changeLoginStatus(): void {
    this.loginService.changeLoginStatus(!this.loginStatus);
  }

  ngOnDestroy() : void {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
    if (this.productSubscription) {
      this.productSubscription.unsubscribe();
    }
  };

}
