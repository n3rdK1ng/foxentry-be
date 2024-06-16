export type SearchQueryType =
  | { match_phrase_prefix: { name: string } }
  | { range: { yield: { gte: number; lte: number } } }
  | { range: { purchases: { gte: number; lte: number } } }

export enum SortBy {
  NAME = 'name',
  YIELD = 'yield',
  PURCHASES = 'purchases',
}

export enum Order {
  ASC = 'asc',
  DESC = 'desc',
}
