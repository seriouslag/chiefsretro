import {Component, OnInit} from "@angular/core";
import {UserService} from "../../services/user.service";
import {User} from "../../interfaces/user";
import {Subscription} from "rxjs/Subscription";
import {RetroService} from "../../services/retro.service";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  private user: User;
  private userSubscription: Subscription;

  constructor(private userService: UserService, private retroService: RetroService) {
  }

  ngOnInit() {
    this.userSubscription = this.userService.user.subscribe(user => {
      this.user = user;
    });

    this.retroService.openCart(false);
  }


  private addToCart(index: number): void {
    this.user.cartItems[index].quantity++;
  }

  private removeFromCart(index: number): void {
    let num = this.user.cartItems[index].quantity;
    if (num > 0) {
      this.user.cartItems[index].quantity--;
    }
  }

  private updateCart(): void {
    this.userService.updateUser(this.user);
  }

}
