import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {Product} from '../../interfaces/product';
import {Subscription} from "rxjs";
import {ProductService} from "../../services/product.service";

@Component({
  selector: 'app-product-template',
  templateUrl: './product-template.component.html',
  styleUrls: ['./product-template.component.css'],

})
export class ProductTemplateComponent implements OnInit, OnDestroy {
  product: Product;

  productSubscription: Subscription;
  paramSubscription: Subscription;


  constructor(private activatedRoute: ActivatedRoute, private productService: ProductService) { }

  getProduct(productId: number) : void {
    this.productSubscription = this.productService.getProductByProductId(productId)
      .subscribe(product => {
          this.product = product;
        }
      );

  }

  ngOnInit() {

    this.paramSubscription = this.activatedRoute.params
      .subscribe(params => {
        this.getProduct(+params['productId'].substring(3))
      });

  }

  ngOnDestroy(): void {
    this.productSubscription.unsubscribe();
    this.paramSubscription.unsubscribe();
  }

}
