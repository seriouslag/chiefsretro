import {Component, OnDestroy, OnInit} from "@angular/core";
import {Product} from "../../interfaces/product";
import {ProductService} from "../../services/product.service";
import {animate, style, transition, trigger} from "@angular/animations";
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'app-autosearch',
  templateUrl: './autosearch.component.html',
  styleUrls: ['./autosearch.component.css'],
  animations: [
    trigger('openclose', [
      transition(':enter', [
        style({
          opacity: 0
        }),
        animate('0.2s 0.2s ease', style({
          opacity: 1
        }))
      ]),
    ]),
  ]
})
export class AutosearchComponent implements OnInit, OnDestroy {

  products: Observable<Product[]>;
  private searchTerms = new Subject<string>();

  constructor(private productService: ProductService) {
  }

  search(event, term: string): void {
    if (event.keyCode != 37 && event.keyCode != 38 && event.keyCode != 39 && event.keyCode != 40 && event.keyCode != 16
      && event.keyCode != 9 && event.keyCode != 17 && event.keyCode != 18 && event.keyCode != 19 && event.keyCode != 20) {
      if (this.checkTerm(term)) {
        this.searchTerms.next(term);
      }
    }
  }

  ngOnInit() {
    this.products = this.searchTerms
      .debounceTime(250)
      .filter((term: string) => term.length > 1)
      .distinctUntilChanged()
      .switchMap(term => term
        ? this.productService.getProductsContainingName(term)
        : Observable.of<Product[]>([]))
      .catch((error) => {
        console.log('Search error', error);
        return Observable.of(<Product[]>([]))
      });
  }


  ngOnDestroy(): void {
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
}
