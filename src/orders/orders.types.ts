export type SearchQueryType =
  | { match_phrase_prefix: { productName: string } }
  | { match_phrase_prefix: { customerName: string } }
  | { range: { price: { gte: number; lte: number } } }
  | { range: { amount: { gte: number; lte: number } } }

export enum SortBy {
  PRODUCT_NAME = 'productName',
  CUSTOMER_NAME = 'customerName',
  PRICE = 'price',
  AMOUNT = 'amount',
}

export enum Order {
  ASC = 'asc',
  DESC = 'desc',
}
