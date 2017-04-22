import {Injectable} from "@angular/core";
import {MdSnackBar} from "@angular/material";

@Injectable()
export class ToastService {

  constructor(private snackbar: MdSnackBar) {
  }

  toast(text: string, button: string, length: number) {
    this.snackbar.open(text, button, {
      duration: length,
    })
  }

}
