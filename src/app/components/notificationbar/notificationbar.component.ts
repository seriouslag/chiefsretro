import {Component, OnInit} from "@angular/core";
import {NotificationService} from "../../services/notification.service";
import {Subscription} from "rxjs/Subscription";
import {animate, group, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-notificationbar',
  templateUrl: './notificationbar.component.html',
  styleUrls: ['./notificationbar.component.css'],
  animations: [
    trigger('toolbar', [
      transition(':enter', [
        style({transform: 'translateY(-50%)'}),
        animate('0.5s ease')
      ]),
      transition(':leave', [
        group([
          animate('0.25s ease', style({
            transform: 'translateY(-50%)',
          })),
        ])
      ])
    ]),
  ]
})
export class NotificationbarComponent implements OnInit {

  private messageSubscription: Subscription;
  private notification: { message: string, show: boolean };

  constructor(private notificationService: NotificationService) {
  }

  ngOnInit() {
    this.messageSubscription = this.notificationService.notification.subscribe(notification => {
      this.notification = notification;
    });
  }

  private toggle() {
    this.notificationService.toggle();
  }

}
