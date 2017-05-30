import {Component, OnDestroy, OnInit} from "@angular/core";
import {AdminService} from "../../services/admin.service";
import {User} from "firebase/app";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  providers: [AdminService]
})
export class AdminComponent implements OnInit, OnDestroy {

  admin: User;
  private adminSubscription = this.adminService._admin.subscribe(admin => {
    this.admin = admin;

    if (admin == null) {
      this.login();
    }
  });

  constructor(private adminService: AdminService) {
  }

  ngOnInit() {
    if (this.admin == null) {
      //show login prompt
    }
  }

  ngOnDestroy() {
    if (this.adminSubscription) {
      this.adminSubscription.unsubscribe();
    }
  }

  private login() {
    this.adminService.changeLoginStatus(true)
  }

  private logout() {
    this.adminService.changeLoginStatus(false);
  }


}
