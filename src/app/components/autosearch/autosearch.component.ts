import {Component, OnDestroy, OnInit} from "@angular/core";
import {Product} from "../../interfaces/product";
import {Subscription} from "rxjs/Subscription";
import {ProductService} from "../../services/product.service";

@Component({
  selector: 'app-autosearch',
  templateUrl: './autosearch.component.html',
  styleUrls: ['./autosearch.component.css']
})
export class AutosearchComponent implements OnInit, OnDestroy {

  products: Product[];
  productsSubscription: Subscription;
  waiting: any;
  waitTime: number = 300;

  constructor(protected productService: ProductService) {
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    if (this.productsSubscription) {
      this.productsSubscription.unsubscribe();
    }
  }

  click(product: Product) {
    this.productService.goToProductPage(product);
  }

  private checkTerm(term: string): boolean {
    //if term has input
    if (term.trim()) {
      //if term has a backslash in it
      if (term.match("[#\\\\\/\<\>\|\*\(\)\;\:]")) {
        //invalid search term
        //add a component?
      } else {
        return true;
      }
    }
    return false;
  }

  search(term: string) {
    this.productService.defaultSearch(term).then(products => this.products = products);
  }

  autosearch(event, term: string) {

    if (event.keyCode != 37 && event.keyCode != 38 && event.keyCode != 39 && event.keyCode != 40 && event.keyCode != 16
      && event.keyCode != 9 && event.keyCode != 17 && event.keyCode != 18 && event.keyCode != 19 && event.keyCode != 20) {
      clearTimeout(this.waiting);
      if (this.waiting) {
        this.waiting = setTimeout(() => {

          if (this.checkTerm(term)) {
            this.search(term);
          }

        }, this.waitTime);
      } else {
        if (this.checkTerm(term)) {
          this.search(term);
        } else {
          //???
          this.products = null;
        }
      }
    }
  }
}
