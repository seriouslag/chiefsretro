export interface Card {
  id: string,
  object: string,
  addressCity: string,
  addressCountry: string,
  addressLine1: string,
  addressLine1Check: string,
  addressLine2: string,
  addressState: string,
  addressZip: string,
  addressZipCheck: string,
  brand: string,
  country: string,
  cvcCheck: string,
  dynamicLast4: string,
  expMonth: number,
  expYear: number,
  fingerprint: string,
  funding: string,
  last4: string,
  metadata: any,
  name: string,
  tokenizationMethod: string
}