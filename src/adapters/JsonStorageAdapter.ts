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

      if (!fs.existsSync(colPath)) fs.writeFileSync(colPath, '[]')
    }

    return this.collections[name]
  }

  public async remove(name: string, condition: (doc: D & BaseDoc) => boolean): Promise<void> {
    const colPath = this.getOrCreateCollectionPath(name)
    const file = fs.readFileSync(colPath, 'utf8')
    const col: (D & BaseDoc)[] = JSON.parse(file)
    const newCol = col.filter(doc => !condition(doc))
    fs.writeFileSync(colPath, JSON.stringify(newCol))
  }

  public async update(name: string, edit: (doc: D & BaseDoc) => D & BaseDoc) {
    const colPath = this.getOrCreateCollectionPath(name)
    const file = fs.readFileSync(colPath, 'utf8')
    const col: (D & BaseDoc)[] = JSON.parse(file)
    col.forEach((item, index) => {
      const doc = edit(item)
      if (doc) col[index] = doc
    })
    fs.writeFileSync(colPath, JSON.stringify(col))
  }

  public async append(name: string, docs: (D & BaseDoc)[]) {
    const colPath = this.getOrCreateCollectionPath(name)
    const file = fs.readFileSync(colPath, 'utf8')
    const col: (D & BaseDoc)[] = JSON.parse(file)
    docs.forEach((doc) => {
      col.push(doc)
    })
    fs.writeFileSync(colPath, JSON.stringify(col))
  }

  public async read(name: string, search: (doc: D & BaseDoc) => boolean) {
    const colPath = this.getOrCreateCollectionPath(name)
    const file = fs.readFileSync(colPath, 'utf8')
    const col: (D & BaseDoc)[] = JSON.parse(file)

    let isContinue = true
    for (let doc of col) {
      if (!isContinue) break
      isContinue = search(doc)
    }
  }

  public async dropCollection(collection: string) {
    const colPath = this.getOrCreateCollectionPath(collection)
    fs.unlinkSync(colPath)
    delete this.collections[collection]
  }
}
