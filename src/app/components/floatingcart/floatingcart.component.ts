import {Component, OnDestroy, OnInit} from "@angular/core";
import {Subscription} from "rxjs/Subscription";
import {CartItem} from "../../interfaces/cart-item";
import {RetroService} from "../../services/retro.service";
import {animate, group, style, transition, trigger} from "@angular/animations";
import {FirebaseService} from "../../services/firebase.service";

@Component({
  selector: 'app-floatingcart',
  templateUrl: './floatingcart.component.html',
  styleUrls: ['./floatingcart.component.css'],
  animations: [
    trigger('openclose', [
      transition(':enter', [
        style({
          transform: 'translateX(-100%)',
          backgroundColor: '#424242'
        }),
        animate(350)
      ]),
    ]),
    trigger('closeopen', [
      transition(':enter', [
        style({transform: 'translateX(100%)'}),
        animate(600)
      ]),
      transition(':leave', [
        group([
          animate('0.2s ease', style({
            transform: 'translateX(100%)'
          })),
          animate('0.5s 0.2s ease', style({
            opacity: 0
          }))
        ])
      ])
    ])
  ]
})
export class FloatingcartComponent implements OnInit, OnDestroy {


  cart: CartItem[] = [];
  private cartSubscription: Subscription;

  constructor(private firebaseService: FirebaseService, private retroService: RetroService) {
  }

  ngOnInit() {
    this.cartSubscription = this.firebaseService.cart.subscribe((cart) => {
      this.cart = cart;
      console.log('float', cart);
    });
  }

  ngOnDestroy() {
    this.cartSubscription.unsubscribe();
  }

  toggleCart(): void {
    this.retroService.toggleCart();
  }

  removeFromCart(cartItem: CartItem) {
    this.firebaseService.removeProductFromCart(cartItem.product, cartItem.productOption, 1);
  }

  addToCart(cartItem: CartItem) {
    this.firebaseService.addProductToCart(cartItem.product, cartItem.productOption, 1, Date.now());
  }

}
