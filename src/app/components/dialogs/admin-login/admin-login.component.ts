import {Component, OnInit} from "@angular/core";
import {animate, style, transition, trigger} from "@angular/animations";
import {AdminService} from "../../../services/admin.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ToastService} from "../../../services/toast.service";

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css'],
  animations: [
    trigger('slideright', [
      transition(':enter', [
        style({
          transform: 'translateX(-100%)',
        }),
        animate(250)
      ]),
    ]),
    trigger('slideleft', [
      transition(':enter', [
        style({
          transform: 'translateX(100%)',
        }),
        animate(250)
      ]),
    ]),
  ]
})
export class AdminLoginComponent implements OnInit {

  adminService: AdminService;
  loginForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required]),
  });

  constructor(private toastService: ToastService) {
  }

  ngOnInit() {
  }

  firebaseEmailLogin(): void {
    this.adminService.firebaseEmailLogin(this.loginForm.controls['email'].value.toLowerCase(), this.loginForm.controls['password'].value).then((response) => {
      if (response == 'ok') {
        //should be handled by event listener
      } else {
        /*
        TODO setup attemp limits
         */
        if (response == 'auth/user-disabled') {
          this.toastService.toast('This account is deactivated');
        } else if (response == 'auth/invalid-email') {
          this.toast('Email is invalid');
        } else if (response == 'auth/user-not-found') {
          this.toast('This email is not found');
        } else if (response == 'auth/wrong-password') {
          this.toast('Password is incorrect');
        } else {
          console.log(response);
          this.toast('Cannot process, unknown error');
        }
      }
    });
  }

  private toast(message: string) {
    this.toastService.toast(message, 'OK', 2000);
  }
}
