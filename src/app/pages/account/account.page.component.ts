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
  orders: Order[] = [];
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
        this.searchOrder = null;
        this.searchId = "";
      }
    });
  }

  getOrderByOrderId(search: string) {
    if (search.length) {
      let index = search.indexOf('/');
      let orderId = search.substring(index, search.length);
      if (index > -1) {
        let custId = search.substring(0, index);

        this.firebaseService.getOrderByOrderId(orderId, custId).take(1).subscribe((order: Order) => {
          if (order.status == null) {
            order = null;
          }
          if (order) {
            this.searchOrder = order;
            this.searchId = order.date + "/" + custId;
            this.searchError = false;
          } else {
            this.searchOrder = null;
            this.searchId = null;
            this.searchError = true;
          }
        });

      } else {
        this.firebaseService.getOrderByOrderId(search).take(1).subscribe((order: Order) => {
          if (order.status == null) {
            order = null;
          }
          if (order) {
            this.searchOrder = order;
            this.searchId = search;
            this.searchError = false;
          } else {
            this.searchOrder = null;
            this.searchId = null;
            this.searchError = true;
          }
        });
      }
    } else {
      this.searchOrder = null;
      this.searchId = null;
      this.searchError = false;
    }


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
