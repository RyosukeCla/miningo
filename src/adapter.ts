import { BaseDoc } from './collection'

export default interface DatabaseAdapter<D = any> {
  dropCollection: (name: string) => Promise<any>

  getJson: (collection: string) => Promise<{ [k: string]: D & BaseDoc }>
  setItems: (collection: string, items: (D & BaseDoc)[]) => Promise<(D & BaseDoc)[]>
  removeItems: (collection: string, ids: string[]) => Promise<(D & BaseDoc)[]>
}
