import DatabaseAdapter from '../adapter'
import { BaseDoc } from '../collection'

export default class LocalStorageAdapter<D> implements DatabaseAdapter<D> {
  private collections: {
    [k: string]: (D & BaseDoc)[]
  }

  private namespace: string

  constructor(namespace: string) {
    this.collections = {}
    this.namespace = namespace
  }

  private getOrCreateCollection(name: string) {
    if (!this.collections[name]) {
      const col = localStorage.getItem(this.getKey(name))
      this.collections[name] = col ? JSON.parse(col) : []
    }
    return this.collections[name]
  }

  private getKey(name: string) {
    return this.namespace + name
  }

  async remove(name: string, condition: (doc: D & BaseDoc) => boolean): Promise<void> {
    const col = this.getOrCreateCollection(name)
    const newCol = col.filter(doc => !condition(doc))
    this.collections[name] = newCol
    localStorage.setItem(this.getKey(name), JSON.stringify(newCol))
  }

  async update(name: string, edit: (doc: D & BaseDoc) => D & BaseDoc): Promise<void> {
    const col = this.getOrCreateCollection(name)

    col.forEach((item: any, index) => {
      const doc = edit(item)
      if (doc) col[index] = doc
    })
    localStorage.setItem(this.getKey(name), JSON.stringify(col))
  }

  async append(name: string, docs: (D & BaseDoc)[]): Promise<void> {
    const col = this.getOrCreateCollection(name)

    docs.forEach((doc) => {
      col.push(doc)
    })
    localStorage.setItem(this.getKey(name), JSON.stringify(col))
  }

  async read(name: string, search: (doc: D & BaseDoc) => boolean) {
    const col = this.getOrCreateCollection(name)
    let isContinue = true

    for (let doc of col) {
      if (!isContinue) return

      isContinue = search(doc)
    }
  }

  async dropCollection(name: string) {
    delete this.collections[name]
    localStorage.setItem(this.getKey(name), '[]')
  }
}
