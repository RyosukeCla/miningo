import DatabaseAdapter from '../adapter';
import { BaseDoc } from '../collection';
export default class LocalStorageAdapter<D> implements DatabaseAdapter<D> {
    private collections;
    private namespace;
    constructor(namespace: string);
    private getOrCreateCollection;
    private getKey;
    remove(name: string, condition: (doc: D & BaseDoc) => boolean): Promise<void>;
    update(name: string, edit: (doc: D & BaseDoc) => D & BaseDoc): Promise<void>;
    append(name: string, docs: (D & BaseDoc)[]): Promise<void>;
    read(name: string, search: (doc: D & BaseDoc) => boolean): Promise<void>;
    dropCollection(name: string): Promise<void>;
}
