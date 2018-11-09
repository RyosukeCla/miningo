import DatabaseAdapter from '../adapter';
import { BaseDoc } from '../collection';
export default class LocalStorageAdapter<D> implements DatabaseAdapter<D> {
    private collections;
    private namespace;
    constructor(namespace: string);
    private getOrCreateCollection;
    private getKey;
    getJson(collection: string): Promise<any>;
    setItems(collection: string, items: (D & BaseDoc)[]): Promise<(D & BaseDoc)[]>;
    removeItems(collection: string, ids: string[]): Promise<(D & BaseDoc)[]>;
    dropCollection(name: string): Promise<void>;
}
