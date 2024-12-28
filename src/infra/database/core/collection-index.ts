export enum IndexSortOrderEnum {
  ASCENDING = 1,
  DESCENDING = -1,
}

export interface ICollectionIndex {
  name: string
  model: Record<string, IndexSortOrderEnum>
  isUnique: boolean
}
