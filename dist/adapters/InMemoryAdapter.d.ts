import DatabaseAdapter from '../adapter';
import { BaseDoc } from '../collection';
export default class InMemoryAdapter<D> implements DatabaseAdapter<D> {
    private collections;
    constructor();
    private getOrCreateCollection;
    getJson(collection: string): Promise<any>;
    setItems(collection: string, items: (D & BaseDoc)[]): Promise<(D & BaseDoc)[]>;
    removeItems(collection: string, ids: string[]): Promise<(D & BaseDoc)[]>;
    dropCollection(name: string): Promise<void>;
}
