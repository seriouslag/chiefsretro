import {Component, OnInit} from "@angular/core";

@Component({
  selector: 'app-login',
  templateUrl: './login.toast.component.html',
  styleUrls: ['./login.toast.component.css'],
  providers: []
})
export class LoginToastComponent implements OnInit {

  profileUrl: string;
  loginMessage: string;

  constructor() {
  }

  ngOnInit() {
  }
}
