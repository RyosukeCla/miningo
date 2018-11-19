import DatabaseAdapter from '../adapter';
import { BaseDoc } from '../collection';
export default class JsonStorageAdapter<D> implements DatabaseAdapter<D> {
    collections: {
        [name: string]: string;
    };
    private dataPath;
    constructor(dataPath: string);
    private getOrCreateCollectionPath;
    remove(name: string, condition: (doc: D & BaseDoc) => boolean): Promise<void>;
    update(name: string, edit: (doc: D & BaseDoc) => D & BaseDoc): Promise<void>;
    append(name: string, docs: (D & BaseDoc)[]): Promise<void>;
    read(name: string, search: (doc: D & BaseDoc) => boolean): Promise<void>;
    dropCollection(collection: string): Promise<void>;
}
