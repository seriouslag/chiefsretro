import {StripeToken} from "./stripe-token";
import {StripeArgs} from "./stripe-args";
import {DbCartItem} from "./db-cart-item";

export interface Order {
  email: string;
  date: number;
  total: number;
  cart: DbCartItem[];
  token: StripeToken;
  args: StripeArgs;
  name?: string;
  status: string;
}
