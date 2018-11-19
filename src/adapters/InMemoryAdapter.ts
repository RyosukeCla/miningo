import DatabaseAdapter from '../adapter'
import { BaseDoc } from '../collection'

export default class InMemoryAdapter<D> implements DatabaseAdapter<D> {
  private collections: {
    [k: string]: (D & BaseDoc)[]
  }

  constructor() {
    this.collections = {}
  }

  private getOrCreateCollection(name: string) {
    if (!this.collections[name]) this.collections[name] = []
    return this.collections[name]
  }

  async remove(name: string, condition: (doc: D & BaseDoc) => boolean): Promise<void> {
    const col = this.getOrCreateCollection(name)

    this.collections[name] = col.filter(doc => !condition(doc))
  }

  async update(name: string, edit: (doc: D & BaseDoc) => D & BaseDoc): Promise<void> {
    const col = this.getOrCreateCollection(name)

    col.forEach((item: any, index) => {
      const doc = edit(item)
      if (doc) col[index] = doc
    })
  }

  async append(name: string, docs: (D & BaseDoc)[]): Promise<void> {
    const col = this.getOrCreateCollection(name)

    docs.forEach((doc) => {
      col.push(doc)
    })
  }

  async read(name: string, search: (doc: D & BaseDoc) => boolean) {
    const col = this.getOrCreateCollection(name)
    let isContinue = true

    for (let doc of col) {
      if (!isContinue) break

      isContinue = search(doc)
    }
  }

  async dropCollection(name: string) {
    delete this.collections[name]
  }
}
