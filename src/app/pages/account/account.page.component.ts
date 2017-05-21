import {Component, OnDestroy, OnInit} from "@angular/core";
import {FirebaseService} from "../../services/firebase.service";
import {Subscription} from "rxjs/Subscription";
import {User} from "firebase/app";
import {Order} from "../../interfaces/order";

import "rxjs/add/operator/take";


@Component({
  selector: 'app-account-page',
  templateUrl: './account.page.component.html',
  styleUrls: ['./account.page.component.css']
})
export class AccountPageComponent implements OnInit, OnDestroy {


  user: User;
  orders: Order[];
  searchOrder: Order;
  searchId: string;
  searchError: boolean = false;
  private userSubscription: Subscription;
  private ordersSubscription: Subscription;

  constructor(private firebaseService: FirebaseService) {
  }

  ngOnInit() {
    this.userSubscription = this.firebaseService.user.subscribe(user => {
      this.user = user;
      if (user) {
        this.firebaseService.getAllOrders().subscribe(orders => {
          console.log(orders);
          this.orders = orders as Order[];
        });
      } else {
        this.orders = [];
      }
    });
  }

  getOrderByOrderId(orderId: string) {
    this.firebaseService.getOrderByOrderId(orderId).take(1).subscribe((order: Order) => {
      if (order.email == null) {
        order = null;
      }
      if (order) {
        this.searchOrder = order;
        this.searchId = orderId;
        this.searchError = false;
      } else {
        this.searchOrder = null;
        this.searchError = true;
      }
    });
  }

  getNumberOfItemsInOrder(order: Order): number {
    let numOfItems = 0;
    for (let cartItem of order.cart) {
      numOfItems += cartItem.quantity;
    }
    return numOfItems;
  }

  getNumAsCurrency(num: number): string {
    return num.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  }

  dateToString(date: string): string {
    let parsedDate = new Date(parseInt(date));
    return (parsedDate.toLocaleDateString() + " @ " + parsedDate.toLocaleTimeString());
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
  }

}
