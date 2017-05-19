import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {Product} from "../../../interfaces/product";
import {ProductOption} from "../../../interfaces/product-option";
import {AnimationConfig, ICarouselConfig} from "angular4-carousel";

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit, OnChanges {
  @Input()
  product: Product;

  @Input()
  selectedProductOptionNumber: number;

  @Input()
  imgIndex: number;

  @Input()
  selectedProductOption: ProductOption;

  @Input()
  animation: boolean;

  imageSources: string[];

  public config: ICarouselConfig = {
    verifyBeforeLoad: true,
    log: false,
    animation: this.animation,
    animationType: AnimationConfig.SLIDE_OVERLAP,
    autoplay: true,
    autoplayDelay: 3000,
    stopAutoplayMinWidth: 960
  };

  imagesUrl = [] as string[][];

  rebuild: boolean = false;

  constructor() {

  }

  ngOnChanges(changes: SimpleChanges): void {
    //when the product changes set the selected productOption to default;
    for (let propName in changes) {
      if (propName == "product" || propName == "selectedProductOptionNumber") {
        this.setup();
      }
    }
  }

  ngOnInit() {
    this.setup();
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
        this.imagesUrl[0].push("src/assets/imageError.jpg");
        this.imgIndex = 0;
        this.selectedProductOptionNumber = 0;
      }
    }
    this.imageSources = this.imagesUrl[this.selectedProductOptionNumber];
    this.rebuild = !this.rebuild;
  }

  imageError(selectedProductOptionNumber: number, imageIndex: number): void {
    this.imagesUrl[selectedProductOptionNumber][imageIndex] = "src/assets/imageError.jpg";
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
          this.imagesUrl[productOptionNumber].push('/src/assets/sku' + this.product.productId + '/' + productOptionImages.productOptionImageOrder + '.jpg');
        }
      }
    } else {
      this.imagesUrl[productOptionNumber] = [] as string[];
      this.imagesUrl[productOptionNumber].push("src/assets/imageError.jpg");
      this.imgIndex = 0;
      this.selectedProductOptionNumber = 0;
    }
  }

}
