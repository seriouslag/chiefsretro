import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from "@angular/core";
import {Product} from "../../../interfaces/product";
import {ProductOption} from "../../../interfaces/product-option";
import {MdTabChangeEvent} from "@angular/material";
import {ToastService} from "../../../services/toast.service";
import {AnalyticsService} from "../../../services/analytics.service";
import {Subscription} from "rxjs/Subscription";
import {animate, group, state, style, transition, trigger} from "@angular/animations";
import {FirebaseService} from "../../../services/firebase.service";
import {CartItem} from "../../../interfaces/cart-item";

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
  animations: [
    trigger('openclose', [
      transition(':enter', [
        style({
          transform: 'translateX(-100%)',
        }),
        animate(350)
      ]),
      transition(':leave', [
        group([
          animate('0.2s ease', style({
            transform: 'translateX(-100%)',
          })),
          animate('0.5s 0.2s ease', style({
            opacity: 0
          }))
        ])
      ])
    ]),
    trigger('heroState', [
      state('inactive', style({
        opacity: ' .25',
        backgroundColor: 'black'
      })),
      state('active', style({
        opacity: ' 1',
      })),
      transition('inactive => active', animate('0.5s 0.2s ease')),
      transition('active => inactive', animate('125ms ease-out'))
    ])
  ]
})

export class ProductComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  product: Product;

  imgIndex: number = 0;
  imgSrc: number = 0;
  selectedProductOptionNumber: number = 0;
  selectedProductOption: ProductOption;

  imgPreload: HTMLImageElement[] = [];

  cart: CartItem[];
  private cartSubscription: Subscription;
  cartContainsSelectedProductOption: boolean = false;

  state: string = "active";
  isAnimating: boolean = true;

  constructor(private toastService: ToastService, private analyticsService: AnalyticsService, private firebaseService: FirebaseService) {
  }

  ngOnInit() {
    this.cartSubscription = this.firebaseService._cart.subscribe((cart) => {
      this.cart = cart;
      this.evalCart();
    });
  }

  startAnimation() {
    if (!this.isAnimating) {
      this.state = "inactive";
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    //when the product changes set the selected productOption to default;
    for (let propName in changes) {
      if (propName == "product") {
        this.selectedProductOption = this.product.productOptions[0];
        this.imgIndex = 0;
        //this.imagePreload();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  selected(event: MdTabChangeEvent): void {
    this.selectedProductOption = this.product.productOptions[event.index];
    this.selectedProductOptionNumber = event.index;
    //reset index to set the selected image back to the first one
    this.imgIndex = 0;

    this.evalCart();
  }

  addToCart(product: Product, productOption: ProductOption, quantity: number) {
    this.firebaseService.addProductToCart(product, productOption, quantity, Date.now());
  }

  animationDone(event: any) {

    if (event.fromState == "active") {
      this.imgSrc = this.imgIndex;
      this.state = "active";
    } else {
      this.isAnimating = false
    }
  }

  private evalCart(): void {
    this.cartContainsSelectedProductOption = false;
    for (let cartItem of this.cart) {
      if (cartItem.productOption) {
        if (cartItem.productOption.productOptionId == this.selectedProductOption.productOptionId) {
          this.cartContainsSelectedProductOption = true;
          break;
        }
      }
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

  removeFromCart(product: Product, productOption: ProductOption, quantity: number) {
    this.firebaseService.removeProductFromCart(product, productOption, quantity);
  }

  showToast(message: string): void {
    this.toastService.toast(message, 'OK', 1000);
  }


  nextImage(): void {
    if (this.imgIndex < (this.selectedProductOption.productOptionImages.length - 1)) {
      this.imgIndex++;
    } else {
      this.imgIndex = 0;
    }
    this.startAnimation();
  }

  previousImage(): void {
    if (this.imgIndex > 0) {
      this.imgIndex--;
    } else {
      this.imgIndex = this.selectedProductOption.productOptionImages.length - 1;
    }
    this.startAnimation();
  }

  swipe(event: any) {
    if (event.type == 'swiperight') {
      this.previousImage();
    } else if (event.type == 'swipeleft') {
      this.nextImage();
    } else {

    }
    this.startAnimation();
  }

  changeImage(index: number): void {
    this.imgIndex = index;
    this.startAnimation();
  }





}
