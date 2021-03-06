import {Component, OnDestroy, OnInit} from "@angular/core";
import {MdDialogRef} from "@angular/material";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {animate, style, transition, trigger} from "@angular/animations";
import {ToastService} from "../../../services/toast.service";
import {FirebaseService} from "../../../services/firebase.service";


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

  firebaseService: FirebaseService;
  showLoginText: boolean;
  action: boolean;
  submitted = false;
  creation = false;
  title = 'Login';

  loginForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, this.validateEmail]),
    password: new FormControl(null, [Validators.required]),
  });

  matchingEmail: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, this.validateEmail]),
    cemail: new FormControl('', [Validators.required]),
  }, this.emailMatchValidator);

  matchingPassword: FormGroup = new FormGroup({
    password: new FormControl(null, [Validators.required, Validators.minLength(8), this.validatePW]),
    cpassword: new FormControl(null, [Validators.required]),
  }, this.passwordMatchValidator);

  accountForm: FormGroup = new FormGroup({
    firstname: new FormControl(null, [Validators.required, Validators.minLength(2)]),
    lastname: new FormControl(null, [Validators.required, Validators.minLength(2)]),
    matchingEmail: this.matchingEmail,
    matchingPassword: this.matchingPassword,
  });

  constructor(public loginDialog: MdDialogRef<LoginComponent>, private toastService: ToastService) {
  }

  firebaseEmailLogin(): void {
    this.firebaseService.firebaseEmailLogin(this.loginForm.controls['email']
      .value.toLowerCase(), this.loginForm.controls['password'].value).then((response) => {
      if (response === 'ok') {
        // should be handled by event listener
      } else {
        /*
         TODO setup attempt limits
         */
        if (response === 'auth/user-disabled') {
          this.toastService.toast('This account is deactivated');
        } else if (response === 'auth/invalid-email') {
          this.toast('Email is invalid');
        } else if (response === 'auth/user-not-found') {
          this.toast('This email is not found');
        } else if (response === 'auth/wrong-password') {
          this.toast('Password is incorrect');
        } else {
          console.log(response);
          this.toast('Cannot process, unknown error');
        }
      }
    });
  }

  private passwordMatchValidator(fg: FormGroup) {
    const password = fg.get('password').value;
    const cpassword = fg.get('cpassword').value;

    if (password === cpassword) {
      fg.get('cpassword').setErrors(null);
      return null;
    } else {
      fg.get('cpassword').setErrors({'mismatch': true});
      return {'mismatch': true}
    }
  }

  private emailMatchValidator(fg: FormGroup) {
    const email = fg.get('email').value;
    const cemail = fg.get('cemail').value;

    if (email.toLowerCase() === cemail.toLowerCase()) {
      fg.get('cemail').setErrors(null);
      return null;
    } else {
      fg.get('cemail').setErrors({'mismatch': true});
      return {'mismatch': true}
    }
  }

  firebaseCreateUserLogin(): void {
    this.submitted = true;
    this.firebaseService.firebaseCreateUserFromEmail(
      this.matchingEmail.controls['email'].value.toLowerCase(), this.matchingPassword.controls['password'].value,
      (this.accountForm.controls['firstname'].value + ' ' + this.accountForm.controls['lastname'].value)).then((response) => {
      if (response === 'ok') {
        this.toast('Created account: ' + this.matchingEmail.controls['email'].value.toLowerCase());
        this.backToLogin();
        this.action = true;
        this.loginDialog.close('force');
      } else {
        this.submitted = false;
        if (response === 'auth/weak-password') {
          this.toastService.toast('Password is too weak');
        } else if (response === 'auth/invalid-email') {
          this.toast('Email is invalid');
        } else if (response === 'auth/email-already-in-use') {
          this.toast('Email is in use, please try another login');
        } else if (response === 'auth/operation-not-allowed') {
          this.toast('This is not allowed at this time');
        } else {
          this.toast('Cannot process, unknown error');
        }
      }
    });
  }

  ngOnInit() {
    this.showLoginText = this.loginDialog.componentInstance.showLoginText;
  };

  ngOnDestroy() {
    if (this.action === false) {
      this.loginDialog.close('canceled');
    }
  }

  firebaseGoogleLogin(): void {
    this.firebaseService.firebaseGoogleLogin();
  }

  firebaseFacebookLogin(): void {
    this.firebaseService.firebaseFacebookLogin();
  }

  firebaseTwitterLogin(): void {
    this.firebaseService.firebaseTwitterLogin();
  }

  private validatePW(fc: FormControl) {
    const PW_REGEXP = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@!%*?&()])[A-Za-z\d$@!%*?&]{8,}/;

    return PW_REGEXP.test(fc.value) ? null : {
      'pw': true
    }
  }

  private validateEmail(fc: FormControl) {
    const EMAIL_REGEXP =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,12}))/i;

    return EMAIL_REGEXP.test(fc.value) ? null : {
      'email': true
    };
  }

  private toast(message: string) {
    this.toastService.toast(message, 'OK', 2000);
  }

  createAccount() {
    this.title = 'Create Account';
    this.creation = true;
    this.submitted = false;
  }

  private backToLogin() {
    this.title = 'Login';
    this.creation = false;
  }

  cancel(): void {
    this.action = true;
    this.loginDialog.close('canceled');
  }
}
