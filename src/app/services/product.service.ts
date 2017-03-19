import { Injectable } from '@angular/core';
import {Headers, Http, Response} from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Product } from '../interfaces/Product'

@Injectable()
export class ProductService {
  private productUrl : string = "/api/product?productId=";
  constructor(private http: Http) { }

  getProduct(productId: number) : Observable<Product> {
    let product$ = this.http
      .get(this.productUrl + productId, {headers: this.getHeaders()})
      .map(mapProduct);
    console.log(product$);
    return product$;
  }

  private getHeaders() {
    let headers = new Headers();
    headers.append('Accept', 'application/json');

    return headers;
  }



}

function  mapProduct(response:Response): Product {
  return toProduct(response.json());
}

function toProduct(response:any): Product {
  let product = <Product>({
    productId: response.productId,
    productName: response.productName,
    productImage: response.productImage,
    productDescription: response.productDescription,
    productQuantity: response.productQuantity,
  });
  console.log('Parsed Product:', product);

  return product;
}
