import DatabaseAdapter from '../adapter';
import { BaseDoc } from '../collection';
interface JsonAdapterCollection {
    path: string;
    isLocalLocking: boolean;
    queue: (() => Promise<any>)[];
}
export default class JsonAdapter<D> implements DatabaseAdapter<D> {
    collections: {
        [name: string]: JsonAdapterCollection;
    };
    private dataPath;
    constructor(dataPath: string);
    private getOrCreateCollection;
    private doJob;
    getJson(collection: string): Promise<any>;
    setItems(collection: string, items: (D & BaseDoc)[]): Promise<any>;
    removeItems(collection: string, ids: string[]): Promise<any>;
    dropCollection(name: string): Promise<void>;
    private startJobLoop;
}
export {};
