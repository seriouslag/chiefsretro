import {Component, OnInit} from "@angular/core";
import {MdDialogRef} from "@angular/material";

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(public logoutDialog: MdDialogRef<LogoutComponent>) {
  }

  ngOnInit() {
  }

  private logout(): void {
    this.logoutDialog.close(1);
  }

  private cancelLogout(): void {
    this.logoutDialog.close(0);
  }

}
