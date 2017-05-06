import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {Product} from "../../../interfaces/product";
import {ProductOption} from "../../../interfaces/product-option";
import {MdTabChangeEvent} from "@angular/material";
import {ToastService} from "../../../services/toast.service";
import {AnalyticsService} from "../../../services/analytics.service";
import {UserService} from "../../../services/user.service";

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

  imgPreload: HTMLImageElement[] = [];

  constructor(private toastService: ToastService, private analyticsService: AnalyticsService, private userService: UserService) {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    //when the product changes set the selected productOption to default;
    for (let propName in changes) {
      if (propName == "product") {
        this.selectedProductOption = this.product.productOptions[0];
        this.index = 0;
        this.imagePreload();
      }
    }
  }

  private addToCart(product: Product, productOption: ProductOption, quantity: number) {
    let check = this.userService.addToCart(product, productOption, quantity);
    console.log();
    if (check == true) {
      this.showToast('Added ' + this.selectedProductOption.productColor + ' ' + product.productName + ' To Cart');
    } else {
      this.showToast('Failed to add this product to your cart');
    }
  }

  imagePreload(): void {
    //reset
    this.imgPreload = [];
    for (let productOption of this.product.productOptions) {
      for (let productOptionImage of productOption.productOptionImages) {
        if (productOptionImage.productOptionImageLocation) {
          let img = new Image();
          img.src = productOptionImage.productOptionImageLocation;
          this.imgPreload.push(img);
        } else {
          let img = new Image();
          img.src = '/src/assets/sku' + this.product.productId + '/' + productOptionImage.productOptionImageOrder + '.jpg';
          img.addEventListener('error', () => {
            this.analyticsService.gaEmitEvent('image', 'error', 'sku' + this.product.productId.toString());
            img.src = '/src/assets/imageError.jpg';
          });
          this.imgPreload.push(img);
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
    if (this.index < (this.selectedProductOption.productOptionImages.length - 1)) {
      this.index++;
    }
  }

  previousImage(): void {
    if (this.index > 0) {
      this.index--;
    }
  }

  showToast(message: string): void {
    this.toastService.toast(message, 'OK', 1000);
  }
}
