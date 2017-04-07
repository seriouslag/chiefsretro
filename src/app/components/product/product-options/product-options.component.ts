import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ProductOption} from "../../../interfaces/product-option";

@Component({
  selector: 'app-product-options',
  templateUrl: './product-options.component.html',
  styleUrls: ['./product-options.component.css']
})
export class OptionsComponent implements OnInit {

  constructor() {
  }

  @Input()
  productOption: ProductOption;

  @Input()
  selectedProductOption: ProductOption;

  @Output("change")
  changeSelectedProductOption: EventEmitter<ProductOption> = new EventEmitter();

  selected() {
    this.selectedProductOption = this.productOption;
    this.changeSelectedProductOption.emit(this.selectedProductOption);
  }

  ngOnInit() {

  }
}
