import {Component, OnDestroy, OnInit} from "@angular/core";
import {Subscription} from "rxjs/Subscription";
import {RetroService} from "../../services/retro.service";
import {FirebaseService} from "../../services/firebase.service";
import {CartItem} from "../../interfaces/cart-item";
import {ToastService} from "../../services/toast.service";

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout.page.component.html',
  styleUrls: ['./checkout.page.component.css']
})
export class CheckoutPageComponent implements OnInit, OnDestroy {

  private oldCart: CartItem[] = [];
  cart: CartItem[] = [];

  private cartSubscription: Subscription;
  private loginSubscription: Subscription;
  private warn: boolean = false;
  private loginStatus: boolean = false;

  constructor(private firebaseService: FirebaseService, private retroService: RetroService, private toastService: ToastService) {
  }

  ngOnInit() {
    this.loginSubscription = this.firebaseService.signedIn.subscribe(status => {
      this.loginStatus = status;
      if (status == false) {
        this.warn = false;
      }
    });


    this.cartSubscription = this.firebaseService.cart.subscribe(cart => {
      //location check can probably be removed after implementing unsubscribing on destroy
      if (this.warn && this.loginStatus && location.pathname == "/checkout") {
        this.toastService.toast('Your cart has been changed from another browser or device.');
        this.warn = true;
      }
      this.cart = cart;

      //build a new object for oldcart to change relation;
      this.oldCart = [];
      for (let cartItem of cart) {
        this.oldCart.push({
          product: cartItem.product,
          productOption: cartItem.productOption,
          quantity: cartItem.quantity,
          dateAdded: cartItem.dateAdded
        } as CartItem)
      }


      if (this.cart.length && this.loginStatus) {
        this.warn = true;
      }
    });

    this.retroService.openCart(false);
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
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

  changeCartItemQuantity(cartItemIndex: number, quantity: any) {
    //if(quantity passes as valid number)
    this.cart[cartItemIndex].quantity = parseInt(quantity);
  }

  updateCart(): void {
    //I think is redundant now;
    let i = 0;
    for (let cartItem of this.cart) {
      if (cartItem.quantity == 0) {
        this.cart.splice(i, 1);
      }
      i++;
    }

    //end redundant

    if (this.compareCarts() == false) {
      this.warn = false;
      this.firebaseService.updateCart(this.cart);
      this.toastService.toast("Your cart has been updated.");
    } else {
      this.toastService.toast('No changes were made to your cart.');
    }
  }

  private compareCarts(): boolean {
    let check = true;
    if (this.cart.length != this.oldCart.length) {
      check = false;
    }

    for (let cartItem of this.cart) {
      for (let oCartItem of this.oldCart) {
        if (cartItem.productOption.productOptionId == oCartItem.productOption.productOptionId) {
          if (cartItem.quantity != oCartItem.quantity) {
            check = false;
            break;
          }
        }
      }
      if (check == false) {
        break;
      }
    }
    return check;
  }

}
