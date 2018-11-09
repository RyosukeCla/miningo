import DatabaseAdapter from '../adapter'
import { BaseDoc } from '../collection'
import { deepCopy } from '../utils'

export default class InMemoryAdapter<D> implements DatabaseAdapter<D> {
  private collections: any

  constructor() {
    this.collections = {}
  }

  private getOrCreateCollection(name: string) {
    if (!this.collections[name]) this.collections[name] = {}
    return this.collections[name]
  }

  async getJson(collection: string) {
    const col = this.getOrCreateCollection(collection)
    return deepCopy(col)
  }

  async setItems(collection: string, items: (D & BaseDoc)[]) {
    const col = this.getOrCreateCollection(collection)
    items.forEach((item) => {
      col[item._id] = item
    })
    return deepCopy(items)
  }

  async removeItems(collection: string, ids: string[]) {
    const col = this.getOrCreateCollection(collection)
    const items: (D & BaseDoc)[] = []
    ids.forEach((id) => {
      const item = col[id]
      if (item) items.push(deepCopy(item))
      delete col[id]
    })
    return items
  }

  async dropCollection(name: string) {
    delete this.collections[name]
  }
}
