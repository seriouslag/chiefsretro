import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {Product} from "../../../interfaces/product";
import {ProductOption} from "../../../interfaces/product-option";

@Component({
  selector: 'app-product-images',
  templateUrl: './product-images.component.html',
  styleUrls: ['./product-images.component.css']
})
export class ProductImagesComponent implements OnInit, OnChanges {

  @Input()
  product: Product;

  @Input()
  selectedProductOptionNumber: number;

  @Input()
  imageIndex: number;

  imagesUrl = [] as string[][];

  ngOnChanges(changes: SimpleChanges): void {
    //when the product changes set the selected productOption to default;
    for (let propName in changes) {
      if (propName == "product") {
        this.setup();
      }
    }
  }

  constructor() {
  }

  ngOnInit() {
    //this.setup();
  }

  setup(): void {
    this.imagesUrl = [] as string[][];
    if (this.product) {
      let p: number = 0;
      if (this.product.productOptions.length) {
        for (let productOption of this.product.productOptions) {
          this.setupImages(productOption, p++);
        }
      } else {
        this.imagesUrl[0] = [] as string[];
        this.imagesUrl[0].push("/assets/imageError.jpg");
        this.imageIndex = 0;
        this.selectedProductOptionNumber = 0;
      }
    }
  }

  imageError(selectedProductOptionNumber: number, imageIndex: number): void {
    this.imagesUrl[selectedProductOptionNumber][imageIndex] = "/assets/imageError.jpg";
  }

  setupImages(productOption: ProductOption, productOptionNumber: number): void {
    if (productOption.productOptionImages.length) {
      for (let productOptionImages of productOption.productOptionImages) {
        if (!this.imagesUrl[productOptionNumber]) {
          this.imagesUrl[productOptionNumber] = [] as string[];
        }
        if (productOptionImages.productOptionImageLocation) {
          this.imagesUrl[productOptionNumber].push(productOptionImages.productOptionImageLocation);
        } else {
          this.imagesUrl[productOptionNumber].push('/assets/sku' + this.product.productId + '/' + productOptionImages.productOptionImageOrder + '.jpg');
        }
      }
    } else {
      this.imagesUrl[productOptionNumber] = [] as string[];
      this.imagesUrl[productOptionNumber].push("/assets/imageError.jpg");
      this.imageIndex = 0;
      this.selectedProductOptionNumber = 0;
    }
  }

}
