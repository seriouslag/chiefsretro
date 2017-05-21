import {Component, OnDestroy, OnInit} from "@angular/core";
import {FirebaseService} from "../../services/firebase.service";
import {Subscription} from "rxjs/Subscription";
import {User} from "firebase/app";
import {Order} from "../../interfaces/order";


@Component({
  selector: 'app-account-page',
  templateUrl: './account.page.component.html',
  styleUrls: ['./account.page.component.css']
})
export class AccountPageComponent implements OnInit, OnDestroy {


  user: User;
  orders: Order[];
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
