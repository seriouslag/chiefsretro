import {ProductOption} from "./product-option";

export interface Product {
  productId: number;
  productName: string;
  productDescription: string;
  productOptions: ProductOption[];

}

