import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {Subscription} from "rxjs/Subscription";
import {RetroService} from "../../services/retro.service";
import {FirebaseService} from "../../services/firebase.service";
import {User} from "firebase/app";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  loginStatus: boolean;
  loginStatusText = 'Login';
  private loginSubscription: Subscription;

  private userSubscription: Subscription;
  user: User;

  @Input()
  showText = false;

  constructor(private firebaseService: FirebaseService, private retroService: RetroService) {
  }

  ngOnInit() {
    this.loginSubscription = this.firebaseService.signedIn.subscribe(loginStatus => {
      this.loginStatus = loginStatus;
      if (this.loginStatus) {
        this.loginStatusText = 'Logout';
      } else {
        this.loginStatusText = 'Login';
      }
    });

    this.userSubscription = this.firebaseService._user.subscribe(user => {
      this.user = user;
    });
  }

  ngOnDestroy(): void {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  changeLoginStatus(): void {
    this.firebaseService.changeLoginStatus(!this.loginStatus);
  }

  toggleCart() {
    if (location.pathname !== '/checkout') {
      this.retroService.toggleCart();
    }
  }

}
