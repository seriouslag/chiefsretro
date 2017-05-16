import {Component, OnInit} from "@angular/core";
import {Subscription} from "rxjs/Subscription";
import {RetroService} from "../../services/retro.service";
import {FirebaseService} from "../../services/firebase.service";
import {CartItem} from "../../interfaces/cart-item";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  cart: CartItem[] = [];
  private cartSubscription: Subscription;

  constructor(private firebaseService: FirebaseService, private retroService: RetroService) {
  }

  ngOnInit() {
    this.cartSubscription = this.firebaseService.cart.subscribe(cart => {
      this.cart = cart;
    });

    this.retroService.openCart(false);
  }


  addToCart(index: number): void {
    this.cart[index].quantity++;
  }

  removeFromCart(index: number): void {
    let num = this.cart[index].quantity;
    if (num > 0) {
      this.cart[index].quantity--;
    }
  }

  updateCart(): void {
    this.firebaseService._cart.next(this.cart);
  }

}
