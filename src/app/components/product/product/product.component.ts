import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {Product} from "../../../interfaces/product";
import {ProductOption} from "../../../interfaces/product-option";

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit, OnChanges {


  @Input()
  product: Product;

  selectedProductOption: ProductOption;

  constructor() {
  }

  changeSelectedProductOption(changeEvent) {
    this.selectedProductOption = changeEvent;
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    //when the product changes set the selected productOption to default;
    for (let propName in changes) {
      if (propName == "product") {
        this.selectedProductOption = this.product.productOptions[0];
      }
    }
  }

}
