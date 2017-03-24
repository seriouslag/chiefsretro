import {Component, OnDestroy, OnInit} from '@angular/core';
import { LoginService } from './services/login-service';
import { Subscription } from "rxjs";
import {ProductService} from "./services/product.service";
import {Product} from './interfaces/product';

import 'rxjs/operator/finally';


@Component({
  selector: 'app-chiefsretro',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [LoginService, ProductService],
})
export class AppComponent implements OnInit, OnDestroy {
  product: Product;
  loginStatus: boolean;
  loginSubscription:Subscription;
  productSubscription:Subscription;

  constructor(private loginService: LoginService) {
  }
  ngOnInit() : void {
    this.loginSubscription = this.loginService.loginStatus$.subscribe(loginStatus => this.loginStatus = loginStatus);
  };

  ngOnDestroy() : void {
      this.loginSubscription.unsubscribe();
      this.productSubscription.unsubscribe();
  };


}
