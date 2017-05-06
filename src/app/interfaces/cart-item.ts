import {Product} from "./product";
import {ProductOption} from "./product-option";

export interface CartItem {
  product: Product;
  productOption: ProductOption;
  quantity: number;
  dateAdded: number;
}
