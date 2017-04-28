import {ProductOptionImage} from "./product-option-image";

export interface ProductOption {
  productColor: string;
  productPrice: number;
  productQuantity: number;
  productOptionId: number;
  productOptionImages: ProductOptionImage[];
}
