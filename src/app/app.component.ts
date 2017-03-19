import {Component, OnDestroy, OnInit} from '@angular/core';
import { LoginService } from './services/login-service';
import { Subscription } from "rxjs";
import {ProductService} from "./services/product.service";
import {ActivatedRoute} from "@angular/router";
import {Product} from './interfaces/product';


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

  constructor(private loginService: LoginService, private productService: ProductService, private route: ActivatedRoute) {
  }

  getProduct(productId: number) : void {
    this.productSubscription = this.route.params.subscribe(params => {
      this.productService.getProduct(productId).subscribe(p => this.product = p);
    });
  }

  ngOnInit() : void {
    this.loginSubscription = this.loginService.loginStatus$.subscribe(loginStatus => this.loginStatus = loginStatus);
  };

  ngOnDestroy() : void {
      this.loginSubscription.unsubscribe();
  };


}
