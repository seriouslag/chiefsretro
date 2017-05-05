import {Injectable} from "@angular/core";
declare const ga: any;

@Injectable()
export class AnalyticsService {

  constructor() {
  }

  public gaEmitEvent(eventCategory: string,
                     eventAction: string,
                     eventLabel: string = null,
                     eventValue: number = null) {
    ga('send', 'event', {
      eventCategory: eventCategory,
      eventLabel: eventLabel,
      eventAction: eventAction,
      eventValue: eventValue
    });
  }

  public gaEmitPageView(url: string): void {
    ga('set', 'page', url);
    ga('send', 'pageview');
    console.log('sending analytics');
  }

}
