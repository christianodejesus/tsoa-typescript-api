export enum IndexSortOrderEnum {
  ASCENDING = 1,
  DESCENDING = -1,
}

export type TIndexSortDictionay = Record<string, IndexSortOrderEnum>

export interface ICollectionIndex {
  name: string
  model: TIndexSortDictionay
  isUnique: boolean
}
