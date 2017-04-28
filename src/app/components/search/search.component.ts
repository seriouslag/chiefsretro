import {Component, OnDestroy, OnInit} from "@angular/core";
import {ProductService} from "../../services/product.service";
import {Subscription} from "rxjs";
import {Product} from "../../interfaces/product";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  providers: [ProductService]
})
export class SearchComponent implements OnInit, OnDestroy {


  terms: string;
  products: Product[];
  waiting;
  productsSubscription: Subscription;


  constructor( protected productService: ProductService) {

  }

  ngOnInit() {}

  ngOnDestroy(): void {
    this.productsSubscription.unsubscribe();
  }

  click(product: Product) {
    this.productService.goToProductPage(product);
  }

  search() {
    clearTimeout(this.waiting);
    this.waiting = setTimeout(() => {

      if (checkTerms(this.terms)) {
        //maybe clean up search terms. take out double spaces, etc
        this.productsSubscription = this.productService.getProductsContainingName(this.terms.trim())
          .finally(() => {
            console.log("finished request");
          })
          .subscribe(products => {
            this.products = products;
          });
      } else {
        this.products = null;
      }
    }, 350);
  }

  change() {
    //set a timeout because the change event fires before the click on the search results
    setTimeout(() => {
      this.terms = "";
      this.products=null;
    }, 200);
  }
}

function checkTerms(terms) {
  //if terms has input
  if (terms.trim()) {

    //if terms has a backslash in it
    if (terms.match("[#\\\/\<\>\|\*\(\)\;\:]")) {
      //invalid search terms
      //add a component
    } else {
      return true;
    }
  }
  return false;
}
