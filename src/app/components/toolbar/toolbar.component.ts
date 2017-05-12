import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {RetroService} from "../../services/retro.service";
import {Subscription} from "rxjs/Subscription";
import {animate, group, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css'],
  animations: [
    trigger('toolbar', [
      transition(':enter', [
        style({transform: 'translateY(-50%)'}),
        animate('0.5s ease')
      ]),
      transition(':leave', [
        group([
          animate('0.25s ease', style({
            transform: 'translateY(-50%)',
          })),
        ])
      ])
    ]), trigger('cart', [
      transition(':enter', [
        style({
          top: '-50%',
        }),
        animate('1s ease-in-out', style({
          top: 0,
        }))
      ]),
      transition(':leave', [
        style({
          top: 0,
        }),
        animate('1s ease-in-out', style({
          top: '-50%',
        }))
      ])
    ]),
  ]
})

export class ToolbarComponent implements OnInit, OnDestroy {

  @Input()
  showCart: boolean;

  private showMobileSearch: boolean;
  private showDesktopNavbar: boolean;
  private showMobileSearchSubscription: Subscription;
  private showDesktopNavbarSubscription: Subscription;

  constructor(private retroService: RetroService) {
  }


  private toggleMobileSearch(): void {
    this.retroService.toggleMobileSearch();
  }


  private toggleDesktopNavbar(): void {
    this.retroService.toggleDesktopNavbar();
  }

  ngOnInit(): void {
    this.showMobileSearchSubscription = this.retroService.showMobileSearch.subscribe(showMobileSearch => {
      this.showMobileSearch = showMobileSearch;
    });

    this.showDesktopNavbarSubscription = this.retroService.showDesktopNavbar.subscribe(showDesktopNavbar => {
      this.showDesktopNavbar = showDesktopNavbar;
    });
  }

  ngOnDestroy(): void {
    if (this.showMobileSearchSubscription) {
      this.showMobileSearchSubscription.unsubscribe();
    }
    if (this.showDesktopNavbarSubscription) {
      this.showDesktopNavbarSubscription.unsubscribe();
    }
  }

}
