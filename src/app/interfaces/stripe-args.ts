export interface StripeArgs {
// Billing name and address
  billing_name: string,
  billing_address_country: string,
  billing_address_zip: string,
  billing_address_state: string,
  billing_address_line1: string,
  billing_address_city: string,
  billing_address_country_code: string,

// Shipping name and address
  shipping_name: string,
  shipping_address_country: string,
  shipping_address_zip: string,
  shipping_address_state: string,
  shipping_address_line1: string,
  shipping_address_city: string,
  shipping_address_country_code: string
}
