import {Component, OnInit} from "@angular/core";
import {MdDialogRef} from "@angular/material";

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {


  showLoginText: string;

  constructor(public logoutDialog: MdDialogRef<LogoutComponent>) {
  }

  ngOnInit() {
  }

  logout(): void {
    this.logoutDialog.close(1);
  }

  cancelLogout(): void {
    this.logoutDialog.close(0);
  }

}
