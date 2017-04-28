import {Component, OnDestroy, OnInit} from "@angular/core";
import {ProductService} from "../../services/product.service";
import {Subscription} from "rxjs/Subscription";
import {Product} from "../../interfaces/product";

@Component({
  selector: 'app-all',
  templateUrl: './all.component.html',
  styleUrls: ['./all.component.css']
})
export class AllComponent implements OnInit, OnDestroy {
  productSubscription: Subscription;
  products: Product[];
  waiting: boolean = true;
  failed: boolean = false;


  ngOnDestroy(): void {
    this.productSubscription.unsubscribe();
  }

  ngOnInit(): void {

    this.productSubscription = this.productService.getAllProducts().subscribe(products => {
      this.products = products;
      this.waiting = false;
    }, (/*maybe do a log*/) => {
      this.failed = true;
      this.waiting = false;
    });
  }

  constructor(private productService: ProductService) {
  }
}
