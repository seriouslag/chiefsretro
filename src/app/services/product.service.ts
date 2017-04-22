import {Injectable} from "@angular/core";
import {Headers, Http, Response} from "@angular/http";
import {Observable} from "rxjs/Rx";
import {Product} from "../interfaces/Product";
import {Router} from "@angular/router";
import {ToastService} from "./toast.service";

@Injectable()
export class ProductService {
  private productUrl: string = '/api/product?productId=';
  private searchUrl: string = '/api/all?productName=';

  constructor(private http: Http, private router: Router, private toastService: ToastService) {
  }

  goToProductPage(product: Product): void {
    this.router.navigate(['/product', 'sku' + product.productId]);
  }

  getProductByProductId(productId: number) : Observable<Product> {
    let product = this.http
      .get(this.productUrl + productId, {headers: this.getHeaders()})
      .map(response => response.json() as Product | {})
      .catch((err) => {
        this.toastService.toast("Product not found", "OK", 2000);
        return this.handleError(err)
      });

    return product;
  }


  //autocomplete searchbox
  populateSearchList(productName: string): Promise<Product[]> {
    return this.http.get(this.searchUrl + productName).map(this.extractData).catch(this.handleError).toPromise();
  }

  //default site search;
  getProductsContainingName(productName: string): Observable<Product[]> {
   return this.http.get(this.searchUrl + productName).map(this.extractData).catch(this.handleError);
 }

  private extractData(response: Response) {
   let body = response.json() as Product[] || {};
   return body;
 }

  private handleError(error: Response | any) {
   let errMsg : String;

    if (error instanceof Response) {
     const body = error.json() || '';
     const err = body.error || JSON.stringify(body);
     errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
   } else {
     errMsg = error.message ? error.message: error.toString();
   }
   console.log(errMsg);
   return Observable.throw(errMsg);
 }

  private getHeaders() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Access-Control-Allow-Origin', 'http://seriouslag.com:5201');
    return headers;
  }
}
