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
  imagesUrl = [] as string[][];
  selectedProductOptionNumber: number = 0;
  imageError: string = '/src/assets/imageError.jpg';

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
        if (this.selectedProductOption) {
          let p: number = 0;
          for (let productOption of this.product.productOptions) {
            this.setupImages(productOption, p++);
          }
        }
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
    if (this.index < (this.imagesUrl[this.selectedProductOptionNumber].length - 1)) {
      this.index++;
    }
  }

  previousImage(): void {
    if (this.index > 0) {
      this.index--;
    }
  }


  setupImages(productOption: ProductOption, productOptionNumber: number): void {
    let i = 0;
    for (let productOptionImages of productOption.productOptionImages) {
      if (!this.imagesUrl[productOptionNumber]) {
        this.imagesUrl[productOptionNumber] = [] as string[];
      }
      if (productOptionImages.productOptionImageLocation) {
        this.imagesUrl[productOptionNumber].push(productOptionImages.productOptionImageLocation);
      } else {
        this.imagesUrl[productOptionNumber].push('/src/assets/sku' + this.product.productId + '/' + productOptionImages.productOptionImageOrder + '.jpg');
      }
      i++;
    }
    console.log(this.imagesUrl);
  }

  showToast(message: string, button: string, time: number): void {
    this.toastService.toast(message, button, time);
  }

}
