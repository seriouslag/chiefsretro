import {Component, OnInit} from "@angular/core";
import {MdDialogRef} from "@angular/material";

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.css']
})
export class CancelComponent implements OnInit {

  constructor(public cancelDialog: MdDialogRef<CancelComponent>) {
  }

  ngOnInit() {
  }

  private confirmCancel(): void {
    this.cancelDialog.close(1);
  }

  private cancelCancel(): void {
    this.cancelDialog.close(0);
  }

}
