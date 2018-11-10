import Collection from './collection'
import DatabaseAdapter from './adapter'

export default class Database {
  private adapter: DatabaseAdapter

  constructor(adapter: DatabaseAdapter) {
    this.adapter = adapter
  }

  collection<D>(name: string, schema?: any): Collection<D> {
    const collectionSchema = schema ? {
      type: 'object',
      properties: schema
    } : undefined

    return new Collection<D>(name, this.adapter, collectionSchema)
  }

  async drop(name: string): Promise<void> {
    await this.adapter.dropCollection(name)
  }
}
