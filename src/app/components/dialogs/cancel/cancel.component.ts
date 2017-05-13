import {Component, OnInit} from "@angular/core";
import {MdDialogRef} from "@angular/material";

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.css']
})
export class CancelComponent implements OnInit {

  customText: string;
  showLoginText: string;

  constructor(public cancelDialog: MdDialogRef<CancelComponent>) {
  }

  ngOnInit() {
  }

  confirmCancel(): void {
    this.cancelDialog.close(1);
  }

  cancelCancel(): void {
    this.cancelDialog.close(0);
  }

}
