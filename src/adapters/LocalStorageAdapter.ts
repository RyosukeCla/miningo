import DatabaseAdapter from '../adapter'
import { BaseDoc } from '../collection'
import { deepCopy } from '../utils'

export default class LocalStorageAdapter<D> implements DatabaseAdapter<D> {
  private collections: any
  private namespace: string

  constructor(namespace: string) {
    this.collections = {}
    this.namespace = namespace
  }

  private getOrCreateCollection(name: string) {
    if (!this.collections[name]) {
      const col = localStorage.getItem(this.getKey(name))
      this.collections[name] = col || {}
    }
    return this.collections[name]
  }

  private getKey(name: string) {
    return this.namespace + '/' + name
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
    localStorage.setItem(this.getKey(collection), col)
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
    localStorage.setItem(this.getKey(collection), col)
    return items
  }

  async dropCollection(name: string) {
    localStorage.removeItem(this.getKey(name))
    delete this.collections[name]
  }
}
