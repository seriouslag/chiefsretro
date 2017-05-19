import {Component, OnDestroy, OnInit} from "@angular/core";
import {Subscription} from "rxjs/Subscription";
import {RetroService} from "../../services/retro.service";
import {FirebaseService} from "../../services/firebase.service";
import {CartItem} from "../../interfaces/cart-item";
import {ToastService} from "../../services/toast.service";
import {MediaChange, ObservableMedia} from "@angular/flex-layout";
import {User} from "firebase/app";

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout.page.component.html',
  styleUrls: ['./checkout.page.component.css']
})
export class CheckoutPageComponent implements OnInit, OnDestroy {

  private oldCart: CartItem[] = [];
  cart: CartItem[] = [];

  private cartSubscription: Subscription;
  public size: number = 2;
  private loginSubscription: Subscription;
  private warn: boolean = false;
  private loginStatus: boolean = false;
  private userSubscription: Subscription;
  private user: User;
  private mediaSubscription: Subscription;
  private handler: any;

  constructor(private firebaseService: FirebaseService, private retroService: RetroService, private toastService: ToastService, public media: ObservableMedia) {
  }

  ngOnInit() {
    this.loginSubscription = this.firebaseService.signedIn.subscribe(status => {
      this.loginStatus = status;
      if (status == false) {
        this.warn = false;
      }
      //check for mobile;
      this.checkMobile();
    });

    this.userSubscription = this.firebaseService.user.subscribe(user => {
      this.user = user;
    });

    (<any>window).addEventListener('popstate', () => {
      if (this.handler) {
        this.handler.close();
      }
    });

    this.mediaSubscription = this.media.subscribe((change: MediaChange) => {
      this.checkMobile()
    });

    this.cartSubscription = this.firebaseService.cart.subscribe((cart) => {

      if (this.warn && this.loginStatus) {
        this.toastService.toast('Your cart has been changed from another browser or device.');
        this.warn = true;
      }

      this.cart = cart;
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

  public openStripe(): void {
    if (this.cart != null && this.handler == null) {
      /*
      THIS CANNOT BE IN A SUBSCRIPTION IT KILLS IT
       */
      this.handler = (<any>window).StripeCheckout.configure({
        key: 'pk_test_4g2s1MP63IBbdSZjlMpfKhq5',
        image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
        locale: 'auto',
        shippingAddress: true,
        billingAddress: true,
        currency: 'USD',
        allowRememberMe: true,
        email: this.user.email,

        token: (token: any, args: any) => {
          // You can access the token ID with `token.id`.
          // Get the token ID to your server-side code for use.
          this.firebaseService.saveStripeToDb(token, args).then((success) => {
            console.log("finished request");
          }, (error) => {
            console.log(error);
          });
        }
      });
    }
    this.updateCart(false).then(() => {
      if (this.handler) {
        this.handler.open({
          name: 'Chiefs Retro',
          description: 'Test Description',
          amount: Math.floor(this.getCartTotal() * 100),
          zipCode: true,
        });
      } else {
        alert('Stripe must be loading still');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
    if (this.mediaSubscription) {
      this.mediaSubscription.unsubscribe();
    }
    if (this.handler) {
      this.handler.close();
    }
  }

  updateCart(showToast?: boolean): Promise<boolean> {
    //setCart in firebaseService checks for zero values before placing in cart
    //I think this is redundant now;

    if (showToast == null) {
      showToast = true;
    }

    let i = 0;
    for (let cartItem of this.cart) {
      if (cartItem.quantity == 0) {
        console.log('remove');
        this.cart = this.cart.splice(i, 1);
      }
      i++;
    }
    //end redundant

    if (this.compareCarts() == false) {
      this.warn = false;
      this.firebaseService.updateCart(this.cart);
      if (showToast) {
        this.toastService.toast("Your cart has been updated.");
      }
    } else {
      if (showToast) {
        this.toastService.toast('No changes were made to your cart.');
      }
    }

    return new Promise(resolve => {
      resolve(true);
    });
  }

  getCartTotal(): number {
    let total: number = 0;
    for (let cartItem of this.cart) {
      total += (cartItem.productOption.productPrice * 100 * cartItem.quantity) / 100;
    }
    return total;
  }

  getNumAsCurrency(num: number): string {
    return num.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  }

  getItemTotal(itemPrice: number, itemQuantity: number): number {
    return (itemPrice * 100 * itemQuantity) / 100;
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

  changeCartItemQuantity(cartItemIndex: number, htmlDomObject: any) {
    htmlDomObject.value = htmlDomObject.value.trim().replace(/[^0-9]/g, "");

    let numMatch = /^[0-9]{1,3}$/;
    //if(quantity passes as valid number)
    if (!htmlDomObject.value.trim()) {
      htmlDomObject.value = "0";
    }
    if (htmlDomObject.value.match(numMatch)) {
      this.cart[cartItemIndex].quantity = parseInt(htmlDomObject.value);
    } else {
    }
  }

  private checkMobile() {
    if (this.media.isActive('xs') || this.media.isActive('sm')) {
      this.size = 1;
    } else {
      this.size = 2;
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
