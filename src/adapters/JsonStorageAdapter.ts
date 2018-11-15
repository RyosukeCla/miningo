import * as fs from 'fs'
import * as path from 'path'
import DatabaseAdapter from '../adapter'
import { BaseDoc } from '../collection'
import { deepCopy } from '../utils'

export default class JsonStorageAdapter<D> implements DatabaseAdapter<D> {
   collections: {
    [name: string]: string
  }

  private dataPath: any

  constructor(dataPath: string) {
    this.dataPath = dataPath
    this.collections = {}

    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath)
    }
  }

  private getOrCreateCollectionPath(name: string) {
    if (!this.collections[name]) {
      const colPath = path.resolve(this.dataPath, name + '.json')

      this.collections[name] = colPath

      if (!fs.existsSync(colPath)) fs.writeFileSync(colPath, '{}')
    }

    return this.collections[name]
  }

  public async getJson(collection: string): Promise<any> {
    const colPath = this.getOrCreateCollectionPath(collection)
    const file = fs.readFileSync(colPath, 'utf8')
    return JSON.parse(file)
  }

  public async setItems(collection: string, items: (D & BaseDoc)[]) {
    const colPath = this.getOrCreateCollectionPath(collection)
    const file = fs.readFileSync(colPath, 'utf8')
    const json = JSON.parse(file)
    items.forEach((item) => {
      json[item._id] = item
    })
    fs.writeFileSync(colPath, JSON.stringify(json))
    return items
  }

  public async removeItems(collection: string, ids: string[]) {
    const colPath = this.getOrCreateCollectionPath(collection)
    const file = fs.readFileSync(colPath, 'utf8')
    const json = JSON.parse(file)
    const items: (D & BaseDoc)[] = []
    ids.forEach((id) => {
      const item = json[id]
      if (item) items.push(deepCopy(item))
      delete json[id]
    })
    fs.writeFileSync(colPath, JSON.stringify(json))
    return items
  }

  public async dropCollection(collection: string) {
    const colPath = this.getOrCreateCollectionPath(collection)
    fs.unlinkSync(colPath)
    delete this.collections[collection]
  }
}
