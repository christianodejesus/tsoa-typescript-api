export interface IDBConfig {
  connectionString: string
  options?: {
    serverSelectionTimeoutMS: number
  }
}
