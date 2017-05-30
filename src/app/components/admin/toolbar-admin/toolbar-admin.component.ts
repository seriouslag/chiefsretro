import {Component, OnDestroy, OnInit} from "@angular/core";
import {AdminService} from "../../../services/admin.service";
import {Subscription} from "rxjs/Subscription";
import {User} from "firebase/app";

@Component({
  selector: 'app-toolbar-admin',
  templateUrl: './toolbar-admin.component.html',
  styleUrls: ['./toolbar-admin.component.css']
})
export class ToolbarAdminComponent implements OnInit, OnDestroy {

  admin: User;
  private adminSubscription: Subscription;

  constructor(private adminService: AdminService) {
  }

  ngOnInit() {
    this.adminSubscription = this.adminService.admin.subscribe(admin => {
      this.admin = admin;
      if (this.admin == null) {

      }
    });
  }

  ngOnDestroy(): void {
    if (this.adminSubscription) {
      this.adminSubscription.unsubscribe();
    }
  }

  public logout(): void {
    this.adminService.changeLoginStatus(false);
  }
}
