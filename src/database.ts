import Collection from './collection'
import DatabaseAdapter from './adapter'

export default class Database {
  private collections: any
  private adapter: DatabaseAdapter

  constructor(adapter: DatabaseAdapter) {
    this.collections = {}
    this.adapter = adapter
  }

  collection<D>(name: string, schema?: any): Collection<D> {
    const collection = this.collections[name]
    if (collection) return collection

    const collectionSchema = schema ? {
      type: 'object',
      properties: schema
    } : undefined

    this.collections[name] = new Collection<D>(name, this.adapter, collectionSchema)
    return this.collections[name]
  }

  async drop(name: string): Promise<void> {
    await this.adapter.dropCollection(name)
    const collection = this.collections[name]
    if (collection) {
      this.collections[name] = undefined
    }
  }
}
