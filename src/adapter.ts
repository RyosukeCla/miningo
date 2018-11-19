import { BaseDoc } from './collection'

export default interface DatabaseAdapter<D = any> {
  dropCollection: (name: string) => Promise<any>

  remove: (name: string, condition: (doc: D & BaseDoc) => boolean) => Promise<void>
  update: (name: string, edit: (doc: D & BaseDoc) => D & BaseDoc) => Promise<void>
  append: (name: string, docs: (D & BaseDoc)[]) => Promise<void>
  read: (name: string, search: (doc: D & BaseDoc) => boolean, opt?: any) => Promise<void>
}
