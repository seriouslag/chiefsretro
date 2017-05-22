import {Component, OnDestroy, OnInit} from "@angular/core";
import {Subscription} from "rxjs/Subscription";
import {ActivatedRoute, Params} from "@angular/router";
import {FirebaseService} from "../../services/firebase.service";
import {Order} from "../../interfaces/order";
import {User} from "firebase/app";
import {CartItem} from "../../interfaces/cart-item";
import {DbCartItem} from "../../interfaces/db-cart-item";

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
  order: Order;
  private paramSubscription: Subscription;
  private orderSubscription: Subscription;
  private userSubscription: Subscription;
  private params: Params;

  constructor(private activatedRoute: ActivatedRoute, private firebaseService: FirebaseService) {
  }

  ngOnInit() {
    this.paramSubscription = this.activatedRoute.params
      .subscribe(params => {
        this.params = params;
        console.log('params', params);
        this.getOrder(params['orderId'], params['custId']);
      });

    this.userSubscription = this.firebaseService.user.subscribe(user => {
      this.user = user;
      this.cart = [];
      this.order = null;
      this.waiting = true;
      if (this.params) {
        this.getOrder(this.params['orderId'], this.params['custId']);
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

  getOrder(orderId: string, custId?: string): void {
    if (custId == null) {
      this.orderSubscription = this.firebaseService.getOrderByOrderId(orderId, false)
        .subscribe(result => {
            if (result) {
              if (result.status != null) {
                this.order = result;
                this.cart = this.populateCart(this.order.cart);
                this.failed = false;
              } else {
                this.orderSubscription = this.firebaseService.getOrderByOrderId(orderId, true).subscribe(result => {
                  console.log('checking result user ', result);
                  if (result.status != null) {
                    this.order = result;
                    this.cart = this.populateCart(this.order.cart);
                    this.failed = false;
                  } else {
                    this.failed = true;
                    console.log('failed to get order of: ' + orderId);
                  }
                });
              }
            }
          },
          (error) => {
            this.failed = true;
            console.log('failed to get order of: ' + orderId, error)
          }
        )
    } else {
      console.log('custId', custId);
      this.orderSubscription = this.firebaseService.getOrderByOrderId(orderId, true, custId)
        .subscribe(result => {
          if (result) {
            if (result.status != null) {
              this.order = result;
              this.cart = this.populateCart(this.order.cart);
              this.failed = false;
            } else {
              this.failed = true;
              console.log('failed to get order of: ' + orderId);
            }
          } else {
            this.failed = true;
            console.log('failed to get order of: ' + orderId);
          }
        });
    }
  }
}
