
export interface StripeToken {
  id: string,
  email: string,
  //card: Card
  clientIp: string,
  created: number,
  livemode: boolean,
  type: string,
  used: boolean
}
