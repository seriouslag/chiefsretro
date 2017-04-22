import {Component, OnDestroy, OnInit} from "@angular/core";
import {LoginService} from "./services/login-service";
import {Subscription} from "rxjs";
import {ProductService} from "./services/product.service";
import {ToastService} from "./services/toast.service";
import {Product} from "./interfaces/product";

import "rxjs/operator/finally";
import {MdSnackBar} from "@angular/material";


@Component({
  selector: 'app-chiefsretro',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [LoginService, ProductService, ToastService],
})
export class AppComponent implements OnInit, OnDestroy {
  product: Product;
  loginStatus: boolean;
  loginSubscription:Subscription;
  productSubscription:Subscription;

  isSearch: boolean = false;

  constructor(private loginService: LoginService, private toast: MdSnackBar) {
  }
  ngOnInit() : void {
    this.loginSubscription = this.loginService.loginStatus$.subscribe(loginStatus => this.loginStatus = loginStatus);
  };

  ngOnDestroy() : void {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
    if (this.productSubscription) {
      this.productSubscription.unsubscribe();
    }
  };

}
