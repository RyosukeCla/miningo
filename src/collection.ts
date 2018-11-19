import { deepCopy, genUniqueId } from './utils'
import DatabaseAdapter from './adapter'
import { Validator } from 'jsonschema'

export interface BaseDoc {
  _id: string
}

export default class Collection<D> {
  private name: string
  private adapter: DatabaseAdapter<D>
  private validator: Validator
  private schema?: any

  constructor(name: string, adapter: DatabaseAdapter<D>, schema?: any) {
    this.name = name
    this.adapter = adapter
    this.schema = schema
    this.validator = new Validator()
  }

  private validate(doc: D | (D & BaseDoc)) {
    if (this.schema) this.validator.validate(doc, this.schema, { throwError: true })
  }

  public async insert(doc: D | (D & BaseDoc)): Promise<D & BaseDoc> {
    this.validate(doc)
    const _id = genUniqueId(this.name)
    const newItem = Object.assign(deepCopy(doc), { _id })
    await this.adapter.append(this.name, [newItem])
    return newItem
  }

  public async insertMany(docs: (D | (D & BaseDoc))[]): Promise<(D & BaseDoc)[]> {
    const items = []
    for (let key in docs) {
      const doc = (docs as any)[key]
      this.validate(doc)
      const _id = genUniqueId(this.name)
      const newItem = Object.assign(deepCopy(doc), { _id })
      items.push(newItem)
    }
    await this.adapter.append(this.name, items)
    return items
  }

  public async find(id: string): Promise<(D & BaseDoc) | undefined> {
    let found = undefined
    await this.adapter.read(this.name, (doc) => {
      if (doc._id === id) {
        found = doc
        return false
      }
      return true
    })
    return found
  }

  public async findMany(ids: string[]): Promise<(D & BaseDoc)[]> {
    const docs: (D & BaseDoc)[] = []
    const searchIds = deepCopy(ids)
    await this.adapter.read(this.name, (doc) => {
      const searchedIndex = searchIds.findIndex(id => doc._id === id)
      if (searchedIndex > -1) {
        docs.push(doc)
        searchIds.splice(searchedIndex, 1)
      }
      return true
    })
    return docs
  }

  public async findAll(): Promise<(D & BaseDoc)[]> {
    const docs: (D & BaseDoc)[] = []
    await this.adapter.read(this.name, (doc) => {
      docs.push(doc)
      return true
    })
    return docs
  }

  public async findBy(query: any): Promise<(D & BaseDoc)[]> {
    const docs: (D & BaseDoc)[] = []
    await this.adapter.read(this.name, (doc) => {
      let match = true
      for (let key in query) {
        if ((doc as any)[key] !== query[key]) {
          match = false
          break
        }
      }
      if (match) docs.push(doc)
      return true
    })
    return docs
  }

  public async update(id: string, doc: D | (D & BaseDoc)): Promise<(D & BaseDoc) | undefined> {
    this.validate(doc)

    const oldDoc = await this.find(id)
    if (!oldDoc) return undefined
    const newItem = Object.assign(deepCopy(doc), { _id: oldDoc._id })

    let isUpdated = false
    await this.adapter.update(this.name, (_doc) => {
      if (!isUpdated && _doc._id === newItem._id) {
        isUpdated = true
        return newItem
      }
    })

    return isUpdated ? newItem : undefined
  }

  public async remove(id: string): Promise<(D & BaseDoc) | undefined> {
    let removed = undefined
    await this.adapter.remove(this.name, (doc) => {
      if (doc._id === id) {
        removed = doc
        return true
      }
      return false
    })
    return removed
  }

  public async removeMany(ids: string[]): Promise<(D & BaseDoc)[]> {
    const docs: (D & BaseDoc)[] = []
    const searchIds = deepCopy(ids)
    await this.adapter.remove(this.name, (doc) => {
      const searchedIndex = searchIds.findIndex(id => doc._id === id)
      if (searchedIndex > -1) {
        docs.push(doc)
        searchIds.splice(searchedIndex, 1)
        return true
      }
      return false
    })
    return docs
  }

  public async size(): Promise<number> {
    let count = 0
    await this.adapter.read(this.name, () => {
      count++
      return true
    }, { raw: true })
    return count
  }
}
