import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {Product} from "../../../interfaces/product";
import {ProductOption} from "../../../interfaces/product-option";
import {MdTabChangeEvent} from "@angular/material";
import {ToastService} from "../../../services/toast.service";

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})

export class ProductComponent implements OnInit, OnChanges {

  @Input()
  product: Product;

  index: number = 0;
  selectedProductOptionNumber: number = 0;
  selectedProductOption: ProductOption;

  constructor(private toastService: ToastService) {
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

  selected(event: MdTabChangeEvent): void {
    this.selectedProductOption = this.product.productOptions[event.index];
    this.selectedProductOptionNumber = event.index;
    //reset index to set the selected image back to the first one
    this.index = 0;
  }

  nextImage(): void {
    if (this.index < (this.selectedProductOption.productOptionImages.length - 1)) {
      this.index++;
    }
  }

  previousImage(): void {
    if (this.index > 0) {
      this.index--;
    }
  }

  showToast(message: string, button: string, time: number): void {
    this.toastService.toast(message, button, time);
  }
}
