import * as fs from 'fs'
import * as readline from 'readline'
import * as path from 'path'
import DatabaseAdapter from '../adapter'
import { BaseDoc } from '../collection'
import mvFile from './utils/mvFile'

const R_STREAM_OPTION = {
  flags: 'r',
  encoding: 'utf8',
  fd: null,
  mode: 438,
}

export default class FastStorageAdapter<D> implements DatabaseAdapter<D> {
  private collections: {
    [name: string]: {
      tempPath: string,
      path: string
    }
  }
  private dataPath: string

  constructor(dataPath: string) {
    this.collections = {}
    this.dataPath = dataPath
  }

  private getOrCreateCollection(name) {
    const col = this.collections[name]
    if (col) return col

    const newCol = {
      tempPath: path.resolve(this.dataPath, name + '.tmp'),
      path: path.resolve(this.dataPath, name)
    }

    this.collections[name] = newCol

    if (!fs.existsSync(newCol.path)) fs.writeFileSync(newCol.path, '')

    return this.collections[name]
  }

  public async dropCollection(name: string) {
    const col = this.getOrCreateCollection(name)
    fs.unlinkSync(col.path)
    delete this.collections[name]
  }

  /**
   * update docs
   * @param name collection name
   * @param edit docs
   */
  public update(name: string, edit: (doc: D & BaseDoc) => D & BaseDoc): Promise<void> {
    return new Promise((resolve, reject) => {
      const col = this.getOrCreateCollection(name)
      const rStream = fs.createReadStream(col.path, R_STREAM_OPTION)
      const rl = readline.createInterface(rStream)

      const wStream = fs.createWriteStream(col.tempPath, { encoding: 'utf8' })
      rl.on('line', line => {
        const update = edit(JSON.parse(line))
        wStream.write((update ? JSON.stringify(update) : line) + '\n')
      })

      rl.on('close', () => {
        wStream.end()
      })

      wStream.on('close', () => {
        mvFile(col.path, col.tempPath).then(() => {
          resolve()
        }).catch((e) => {
          reject(e)
        })
      })
    })
  }

  public remove(name: string, condition: (doc: D & BaseDoc) => boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      const col = this.getOrCreateCollection(name)
      const rStream = fs.createReadStream(col.path, R_STREAM_OPTION)
      const rl = readline.createInterface(rStream)

      const wStream = fs.createWriteStream(col.tempPath, { encoding: 'utf8' })
      rl.on('line', line => {
        const isRemove = condition(JSON.parse(line))
        if (!isRemove) wStream.write(line + '\n')
      })

      rl.on('close', () => {
        wStream.end()
      })

      wStream.on('close', () => {
        mvFile(col.path, col.tempPath).then(() => {
          resolve()
        }).catch((e) => {
          reject(e)
        })
      })
    })
  }

  /**
   * append docs
   * @param name collection name
   * @param docs
   */
  public append(name: string, docs: (D & BaseDoc)[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const col = this.getOrCreateCollection(name)
      const stream = fs.createWriteStream(col.path, { flags : 'a', encoding: 'utf8' })
      stream.on('finish', () => {
        resolve()
      })
      stream.on('error', (err) => {
        reject(err)
      })
      stream.on('open', () => {
        docs.forEach((doc) => {
          stream.write(JSON.stringify(doc) + '\n')
        })
        stream.end()
      })
    })
  }

  /**
   * @param name collection name
   * @param search should return true if continue read, or return false if destroy readable stream
   */
  public read(name: string, search: (doc: D & BaseDoc) => boolean, opt: any = { raw: false }): Promise<void> {
    return new Promise(resolve => {
      const col = this.getOrCreateCollection(name)
      const stream = fs.createReadStream(col.path, R_STREAM_OPTION)

      const rl = readline.createInterface(stream)

      let isContinue = true
      rl.on('line', (line) => {
        if (!isContinue) return

        isContinue = search(opt.raw ? line : JSON.parse(line))

        if (!isContinue) {
          rl.close()
          resolve()
        }
      })

      rl.on('close', () => {
        resolve()
      })
    })
  }
}
