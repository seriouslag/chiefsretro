import {Component, OnDestroy, OnInit} from "@angular/core";
import {Subscription} from "rxjs/Subscription";
import {ActivatedRoute} from "@angular/router";
import {FirebaseService} from "../../services/firebase.service";
import {Order} from "../../interfaces/order";
import {User} from "firebase/app";
import {CartItem} from "../../interfaces/cart-item";
import {DbCartItem} from "../../interfaces/db-cart-item";
import {isUndefined} from "util";

@Component({
  selector: 'app-status-page',
  templateUrl: './status.page.component.html',
  styleUrls: ['./status.page.component.css']
})
export class StatusPageComponent implements OnInit, OnDestroy {


  failed: boolean = false;
  waiting: boolean = true;
  user: User;
  cart: CartItem[] = [];
  private paramSubscription: Subscription;
  private orderSubscription: Subscription;
  private userSubscription: Subscription;
  private order: Order;
  private params;

  constructor(private activatedRoute: ActivatedRoute, private firebaseService: FirebaseService) {
  }

  ngOnInit() {
    this.paramSubscription = this.activatedRoute.params
      .subscribe(params => {
        this.params = params;
        console.log('params', params);
        if (this.user) {
          this.getOrder(params['orderId']),
            (error) => {
              console.log('something broke', error);
            }
        }
      });

    this.userSubscription = this.firebaseService.user.subscribe(user => {
      this.user = user;
      if (user && this.params) {
        this.getOrder(this.params['orderId']);
      } else {
        this.cart = [];
        this.order = null;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.orderSubscription) {
      this.orderSubscription.unsubscribe();
    }
    if (this.paramSubscription) {
      this.paramSubscription.unsubscribe();
    }
  }

  getNumAsCurrency(num: number): string {
    return num.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  }

  dateToString(date: string) {
    let parsedDate = new Date(parseInt(date));
    return (parsedDate.toLocaleDateString() + " @ " + parsedDate.toLocaleTimeString());
  }

  populateCart(dbCart: DbCartItem[]): CartItem[] {
    return this.firebaseService.dbCartToCart(dbCart);
  }

  getOrder(orderId: string): void {
    this.orderSubscription = this.firebaseService.getOrderByOrderId(orderId, !isUndefined(this.user))
      .subscribe(result => {
          this.order = result;
          this.cart = this.populateCart(this.order.cart);
          this.failed = false;
        },
        (error) => {
          this.failed = true;
          console.log('failed to get order of: ' + orderId, error)
        }
      )
  };
}
