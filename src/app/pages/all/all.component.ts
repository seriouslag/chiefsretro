import {Product} from "../../interfaces/product";
import {animate, group, style, transition, trigger} from "@angular/animations";
import {Observable} from "rxjs/Observable";
import {Component, OnDestroy, OnInit} from "@angular/core";
import {ProductService} from "../../services/product.service";

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
  productList: Observable<Product[]>;
  failed = false;
  waiting = true;

  /*
   TODO change product list to groups of small requests using pagination
   */

  ngOnDestroy(): void {
  }

  search(): Observable<Product[]> {
    return this.productService.getAllProducts();
  }

  ngOnInit() {
    this.productList = this.search();
    this.productList.subscribe(() => {
        this.waiting = false;
      }, (error) => this.failed = true
    )
  }

  constructor(private productService: ProductService) {
  }
}
