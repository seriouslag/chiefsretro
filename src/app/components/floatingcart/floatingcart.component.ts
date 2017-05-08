import {Component, OnDestroy, OnInit} from "@angular/core";
import {UserService} from "../../services/user.service";
import {User} from "../../interfaces/user";
import {Subscription} from "rxjs/Subscription";
import {CartItem} from "../../interfaces/cart-item";
import {RetroService} from "../../services/retro.service";
import {animate, group, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-floatingcart',
  templateUrl: './floatingcart.component.html',
  styleUrls: ['./floatingcart.component.css'],
  animations: [
    trigger('openclose', [
      transition(':enter', [
        style({
          transform: 'translateX(-100%)',
          background: '#424242'
        }),
        animate(350)
      ]),
      transition(':leave', [
        group([
          animate('0.2s ease', style({
            transform: 'translateX(-100%)',
            background: '#424242',
          })),
          animate('0.5s 0.2s ease', style({
            opacity: 0
          }))
        ])
      ])
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


  private user: User;
  private userSubscription: Subscription;

  constructor(private userService: UserService, private retroService: RetroService) {
  }

  ngOnInit() {
    this.userSubscription = this.userService.getUser().subscribe((user) => {
      this.user = user;
    });
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  private toggleCart(): void {
    this.retroService.toggleCart();
  }

  private removeFromCart(cartItem: CartItem) {
    this.userService.removeFromCart(cartItem.product, cartItem.productOption, 1);
  }

  private addToCart(cartItem: CartItem) {
    this.userService.addToCart(cartItem.product, cartItem.productOption, 1);
  }

}
