import { TDBOrder } from "./mongodb.client"

export interface IDBFindOptions {
  order?: TDBOrder
  limit?: number
  page?: number
}
