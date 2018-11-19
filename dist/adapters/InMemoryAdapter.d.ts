import DatabaseAdapter from '../adapter';
import { BaseDoc } from '../collection';
export default class InMemoryAdapter<D> implements DatabaseAdapter<D> {
    private collections;
    constructor();
    private getOrCreateCollection;
    remove(name: string, condition: (doc: D & BaseDoc) => boolean): Promise<void>;
    update(name: string, edit: (doc: D & BaseDoc) => D & BaseDoc): Promise<void>;
    append(name: string, docs: (D & BaseDoc)[]): Promise<void>;
    read(name: string, search: (doc: D & BaseDoc) => boolean): Promise<void>;
    dropCollection(name: string): Promise<void>;
}
