import {Component, Input, OnInit} from "@angular/core";
import {Product} from "../../../interfaces/product";

@Component({
  selector: 'app-thumb-image',
  templateUrl: './thumb-image.component.html',
  styleUrls: ['./thumb-image.component.css']
})
export class ThumbImageComponent implements OnInit {

  @Input()
  product: Product;

  imageSrc: string;

  @Input()
  rounded: boolean;


  constructor() {
  }

  ngOnInit() {
    for (let productOption of this.product.productOptions) {
      if (productOption.productOptionImages) {
        for (let productOptionImage of productOption.productOptionImages) {
          if (productOptionImage.productOptionImageLocation) {
            if (!this.imageSrc) {
              this.imageSrc = productOptionImage.productOptionImageLocation;
              break;
            } else {
              break;
            }
          } else {
            if (productOptionImage.productOptionImageOrder) {
              if (!this.imageSrc) {
                this.imageSrc = "src/assets/sku" + this.product.productId + "/" + productOptionImage.productOptionImageOrder + ".jpg";
                break;
              } else {
                break;
              }
            }
          }
        }
      }
    }
  }

  imageError() {
    this.imageSrc = "src/assets/imageError.jpg";
    //do a log
  }

}
