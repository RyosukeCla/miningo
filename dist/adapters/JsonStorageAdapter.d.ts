import DatabaseAdapter from '../adapter';
import { BaseDoc } from '../collection';
export default class JsonAdapter<D> implements DatabaseAdapter<D> {
    collections: {
        [name: string]: string;
    };
    private dataPath;
    constructor(dataPath: string);
    private getOrCreateCollectionPath;
    getJson(collection: string): Promise<any>;
    setItems(collection: string, items: (D & BaseDoc)[]): Promise<(D & BaseDoc)[]>;
    removeItems(collection: string, ids: string[]): Promise<(D & BaseDoc)[]>;
    dropCollection(collection: string): Promise<void>;
}
