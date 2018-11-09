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
    this.validator.validate(doc, this.schema, { throwError: true })
  }

  public async insert(doc: D | (D & BaseDoc)): Promise<D & BaseDoc> {
    this.validate(doc)
    const _id = genUniqueId(this.name)
    const newItem = Object.assign(deepCopy(doc), { _id })
    return (await this.adapter.setItems(this.name, [newItem]))[0]
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
    return await this.adapter.setItems(this.name, items)
  }

  public async find(id: string): Promise<(D & BaseDoc) | undefined> {
    const json = await this.adapter.getJson(this.name)
    return json[id]
  }

  public async findMany(ids: string[]): Promise<(D & BaseDoc)[]> {
    const json = await this.adapter.getJson(this.name)
    const result: (D & BaseDoc)[] = []
    ids.forEach((id) => {
      const doc = json[id]
      if (doc) result.push(doc)
    })
    return result
  }

  public async findAll(): Promise<(D & BaseDoc)[]> {
    const json = await this.adapter.getJson(this.name)
    const result = []
    for (let docKey in json) {
      result.push(json[docKey])
    }
    return result
  }

  public async findBy(query: any): Promise<(D & BaseDoc)[]> {
    const json = await this.adapter.getJson(this.name)
    const result = []
    for (let docKey in json) {
      const doc = json[docKey]
      for (let key in query) {
        if ((doc as any)[key] === query[key]) {
          result.push(doc)
        }
      }
    }
    return result
  }

  public async update(id: string, doc: D | (D & BaseDoc)): Promise<(D & BaseDoc) | undefined> {
    this.validate(doc)

    const oldDoc = await this.find(id)
    if (!oldDoc) return undefined
    const newItem = Object.assign(deepCopy(doc), { _id: oldDoc._id })

    const updated = await this.adapter.setItems(this.name, [newItem])
    return updated.length > 0 ? updated[0] : undefined
  }

  public async remove(id: string): Promise<(D & BaseDoc) | undefined> {
    const removed = await this.adapter.removeItems(this.name, [id])
    return removed.length > 0 ? removed[0] : undefined
  }

  public async removeMany(ids: string[]): Promise<(D & BaseDoc)[]> {
    return await this.adapter.removeItems(this.name, ids)
  }

  public async size(): Promise<number> {
    const json = await this.adapter.getJson(this.name)
    return Object.keys(json).length
  }
}
