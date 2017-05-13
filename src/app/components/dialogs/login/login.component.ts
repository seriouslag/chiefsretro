import {Component, OnDestroy, OnInit} from "@angular/core";
import {MdDialogRef} from "@angular/material";
import {LoginService} from "../../../services/login.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {animate, style, transition, trigger} from "@angular/animations";
import {ToastService} from "../../../services/toast.service";


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
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

export class LoginComponent implements OnInit, OnDestroy {

  loginService: LoginService;
  showLoginText: boolean;
  action: boolean;

  private submitted: boolean = false;

  private creation: boolean = false;
  private title: string = "Login";


  constructor(public loginDialog: MdDialogRef<LoginComponent>, private toastService: ToastService) {
  }

  private validateEmail(fc: FormControl) {
    let EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,12}))/i;

    return EMAIL_REGEXP.test(fc.value) ? null : {
      'email': true
    };
  }

  private passwordMatchValidator(fg: FormGroup) {
    let password = fg.get('password').value;
    let cpassword = fg.get('cpassword').value;

    if (password === cpassword) {
      fg.get('cpassword').setErrors(null);
      return null;
    } else {
      fg.get('cpassword').setErrors({'mismatch': true});
      return {'mismatch': true}
    }
  }

  private emailMatchValidator(fg: FormGroup) {
    let email = fg.get('email').value;
    let cemail = fg.get('cemail').value;

    if (email.toLowerCase() === cemail.toLowerCase()) {
      fg.get('cemail').setErrors(null);
      return null;
    } else {
      fg.get('cemail').setErrors({'mismatch': true});
      return {'mismatch': true}
    }
  }

  private loginForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, this.validateEmail]),
    password: new FormControl(null, [Validators.required]),
  });

  /*
   TODO Add regex for passwords
   */

  private matchingEmail: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, this.validateEmail]),
    cemail: new FormControl('', [Validators.required]),
  }, this.emailMatchValidator);

  private matchingPassword: FormGroup = new FormGroup({
    password: new FormControl(null, [Validators.required, Validators.minLength(8)]),
    cpassword: new FormControl(null, [Validators.required]),
  }, this.passwordMatchValidator);

  private accountForm: FormGroup = new FormGroup({
    firstname: new FormControl(null, [Validators.required, Validators.minLength(2)]),
    lastname: new FormControl(null, [Validators.required, Validators.minLength(2)]),
    matchingEmail: this.matchingEmail,
    matchingPassword: this.matchingPassword,
  });


  ngOnInit() {
    this.showLoginText = this.loginDialog.componentInstance.showLoginText;
  };

  ngOnDestroy() {
    if (this.action == false) {
      this.loginDialog.close('canceled');
    }
  }


  firebaseGoogleLogin(): void {
    this.loginService.firebaseGoogleLogin();
  }

  firebaseFacebookLogin(): void {
    this.loginService.firebaseFacebookLogin();
  }

  firebaseTwitterLogin(): void {
    this.loginService.firebaseTwitterLogin();
  }

  firebaseEmailLogin(): void {
    this.loginService.firebaseEmailLogin(this.loginForm.controls['email'].value.toLowerCase(), this.loginForm.controls['password'].value);
  }

  firebaseCreateUserLogin(): void {
    this.submitted = true;
    this.loginService.firebaseCreateUserFromEmail(this.matchingEmail.controls['email'].value.toLowerCase(), this.matchingPassword.controls['password'].value).then((response) => {
      if (response == 'ok') {
        this.toastService.toast("Created account: " + this.matchingEmail.controls['email'].value.toLowerCase());
        this.backToLogin();
        this.action = true;
        this.loginDialog.close('force');
      } else {
        this.submitted = false;
        if (response == 'auth/weak-password') {
          this.toastService.toast('Password is too weak');
        } else if (response == 'auth/invalid-email') {
          this.toastService.toast('Email is invalid');
        } else if (response == 'auth/email-already-in-use') {
          this.toastService.toast('Email is in use, please try another login');
        } else if (response == 'auth/operation-not-allowed') {
          this.toastService.toast('This is not allowed at this time');
        } else {
          this.toastService.toast('Cannot process, unknown error');
        }
      }
    });
  }

  private createAcccount() {
    this.title = "Create Account";
    this.creation = true;
    this.submitted = false;
  }

  private backToLogin() {
    this.title = "Login";
    this.creation = false;
  }

  cancel(): void {
    this.action = true;
    this.loginDialog.close('canceled');
  }
}
