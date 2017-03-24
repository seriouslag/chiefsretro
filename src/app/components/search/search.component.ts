import { Component, OnInit } from '@angular/core';
import {ProductService} from "../../services/product.service";
import { Subscription} from "rxjs";
import {Product} from "../../interfaces/product";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  providers: [ProductService]
})
export class SearchComponent implements OnInit {

  terms: string = "";
  products: Product[];
  waiting;
  productsSubscription: Subscription;


  constructor( protected productService: ProductService) {

  }

  /*
  TODO
    maybe add a <datalist> for the imput instead
   https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist
   */


  ngOnInit() {}

  click(product: Product) {
    this.productService.goToProductPage(product);
  }

  search() {
    this.waiting = setTimeout(() => {
      if (checkTerms(this.terms)) {
        this.productsSubscription = this.productService.productsContainsName(this.terms.trim())
          .finally(() => {
            if (!this.terms) {
              //this.products = null;
            }
            console.log("finished request");
          })
          .subscribe(products => {
            this.products = products;
          });
      } else {
        this.products = null;
      }
    }, 200);
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
  if(terms)  {
    if(terms.indexOf("\\") !== 0) {
      return true;
    }
  }
  return false;
}
