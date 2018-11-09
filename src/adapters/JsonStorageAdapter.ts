import * as fs from 'fs'
import * as path from 'path'
import DatabaseAdapter from '../adapter'
import { BaseDoc } from '../collection'
import { deepCopy } from '../utils'

interface JsonAdapterCollection {
  path: string,
  isLocalLocking: boolean,
  queue: (() => Promise<any>)[]
}

export default class JsonAdapter<D> implements DatabaseAdapter<D> {
   collections: {
    [name: string]: JsonAdapterCollection
  }

  private dataPath: any

  constructor(dataPath: string) {
    this.dataPath = dataPath
    this.collections = {}

    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath)
    }

    this.startJobLoop()
  }

  private async getOrCreateCollection(name: string) {
    if (!this.collections[name]) {
      const colPath = path.resolve(this.dataPath, name)
      const col: JsonAdapterCollection = {
        path: colPath,
        isLocalLocking: false,
        queue: []
      }

      this.collections[name] = col

      await this.doJob(name, async () => {
        if (!fs.existsSync(col.path)) fs.writeFileSync(col.path, '{}')
      })
    }

    return this.collections[name]
  }

  private async doJob(name: string, job: (col: JsonAdapterCollection) => Promise<any>): Promise<any> {
    const col = await this.getOrCreateCollection(name)
    if (!col) return
    return await new Promise((resolve, reject) => {
      col.queue.push(async () => {
        try {
          resolve(await job(col))
        } catch(e) {
          reject(e)
        }
      })
    })
  }

  public async getJson(collection: string): Promise<any> {
    const col = await this.getOrCreateCollection(collection)
    return await this.doJob(collection, async () => {
      const file = fs.readFileSync(col.path, 'utf8')
      return JSON.parse(file)
    })
  }

  public async setItems(collection: string, items: (D & BaseDoc)[]) {
    const col = await this.getOrCreateCollection(collection)
    return await this.doJob(collection, async () => {
      const file = fs.readFileSync(col.path, 'utf8')
      const json = JSON.parse(file)
      items.forEach((item) => {
        json[item._id] = item
      })
      fs.writeFileSync(col.path, JSON.stringify(json))
      return items
    })
  }

  public async removeItems(collection: string, ids: string[]) {
    const col = await this.getOrCreateCollection(collection)
    return await this.doJob(collection, async () => {
      const file = fs.readFileSync(col.path, 'utf8')
      const json = JSON.parse(file)
      const items: (D & BaseDoc)[] = []
      ids.forEach((id) => {
        const item = json[id]
        if (item) items.push(deepCopy(item))
        delete json[id]
      })
      fs.writeFileSync(col.path, JSON.stringify(json))
      return items
    })
  }

  public async dropCollection(name: string) {
    await this.doJob(name, async (col) => {
      fs.unlinkSync(col.path)
      delete this.collections[name]
    })
  }

  private startJobLoop() {
    setTimeout(() => {
      for(let key in this.collections) {
        const col = this.collections[key]
        if (!col || col.queue.length === 0 || col.isLocalLocking) return
        // lock
        col.isLocalLocking = true

        const job = col.queue.shift()
        job().then(() => {

          // unlock
          col.isLocalLocking = false
        })
      }

      this.startJobLoop()
    }, 1)
  }
}
