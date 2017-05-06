import {Component, OnDestroy, OnInit} from "@angular/core";
import {UserService} from "../../services/user.service";
import {User} from "../../interfaces/user";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'app-floatingcart',
  templateUrl: './floatingcart.component.html',
  styleUrls: ['./floatingcart.component.css']
})
export class FloatingcartComponent implements OnInit, OnDestroy {


  private user: User;
  private userSubscription: Subscription;

  constructor(private userService: UserService) {
  }

  ngOnInit() {
    this.userSubscription = this.userService.getUser().subscribe((user) => {
      this.user = JSON.parse(JSON.stringify(user)) as User;
    });
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

}
