import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {Product} from "../../../interfaces/product";

@Component({
  selector: 'app-thumb-image',
  templateUrl: './thumb-image.component.html',
  styleUrls: ['./thumb-image.component.css']
})
export class ThumbImageComponent implements OnInit, OnChanges {

  @Input()
  product: Product;

  imageSrc: string = "";

  @Input()
  rounded: boolean;

  @Input()
  size: number = 0;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    //when the product changes set the selected productOption to default;
    for (let propName in changes) {
      if (propName == "product") {
        this.setup();
      }
    }
  }

  ngOnInit() {

  }

  setup() {
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
                this.imageSrc = "/assets/sku" + this.product.productId + "/" + productOptionImage.productOptionImageOrder + ".jpg";
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
    this.imageSrc = "/assets/imageError.jpg";
    //do a log
  }

}
