import {Component, Input, OnInit} from "@angular/core";

@Component({
  selector: 'app-notificationbar',
  templateUrl: './notificationbar.component.html',
  styleUrls: ['./notificationbar.component.css']
})
export class NotificationbarComponent implements OnInit {

  @Input()
  message: string;


  constructor() {
  }

  ngOnInit() {
  }

}
