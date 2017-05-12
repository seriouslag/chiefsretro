import {CartItem} from "./cart-item";
export interface User {
  id: number;
  email: string;
  fname: string;
  lname: string;
  femail?: string;
  gemail?: string;
  img?: string;

  google?: any;
  fb?: any;
  firebase?: any;

  cartItems: CartItem[];


}
