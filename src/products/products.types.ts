import { ProductDto } from './products.dto'

export type Product = ProductDto
export type SearchQueryType =
  | { match_phrase_prefix: { name: string } }
  | { range: { price: { gte: number; lte: number } } }
  | { range: { stock: { gte: number; lte: number } } }
