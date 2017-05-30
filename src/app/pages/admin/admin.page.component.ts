import {Component, OnDestroy, OnInit} from "@angular/core";
import {AdminService} from "../../services/admin.service";
import {User} from "firebase/app";
import {RetroService} from "../../services/retro.service";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin.page.component.html',
  styleUrls: ['./admin.page.component.css']
})
export class AdminPageComponent implements OnInit, OnDestroy {



  admin: User;
  private adminSubscription: Subscription;

  constructor(private adminService: AdminService, private retroService: RetroService) {
  }

  ngOnInit() {
    console.log('here');
    if (this.admin == null) {
    }

    this.adminSubscription = this.adminService._admin.subscribe(admin => {
      this.admin = admin;
      console.log('admin', admin);

      if (admin == null) {
        this.login();
      } else {
        this.retroService.setAdmin(true);
      }

    })

  }

  ngOnDestroy() {
  }

  private login() {
    this.adminService.changeLoginStatus(true)
  }

}
