import {Component, OnDestroy, OnInit} from "@angular/core";
import {ProductService} from "../../services/product.service";
import {Subscription} from "rxjs/Subscription";
import {Product} from "../../interfaces/product";
import {animate, group, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-all',
  templateUrl: './all.component.html',
  styleUrls: ['./all.component.css'],
  animations: [
    trigger('enterleave', [
      transition(':enter', [
        style({
          transform: 'translateX(-100%)',
          background: '#424242'
        }),
        animate(750)
      ]),
      transition(':leave', [
        group([
          animate('0.2s ease', style({
            transform: 'translateX(-100%)',
            background: '#424242',
          })),
          animate('0.5s 0.2s ease', style({
            opacity: 0
          }))
        ])
      ])
    ]),
  ]
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
