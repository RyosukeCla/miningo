import DatabaseAdapter from './adapter';
export interface BaseDoc {
    _id: string;
}
export default class Collection<D> {
    private name;
    private adapter;
    private validator;
    private schema?;
    constructor(name: string, adapter: DatabaseAdapter<D>, schema?: any);
    private validate;
    insert(doc: D | (D & BaseDoc)): Promise<D & BaseDoc>;
    insertMany(docs: (D | (D & BaseDoc))[]): Promise<(D & BaseDoc)[]>;
    find(id: string): Promise<(D & BaseDoc) | undefined>;
    findMany(ids: string[]): Promise<(D & BaseDoc)[]>;
    findAll(): Promise<(D & BaseDoc)[]>;
    findBy(query: any): Promise<(D & BaseDoc)[]>;
    update(id: string, doc: D | (D & BaseDoc)): Promise<(D & BaseDoc) | undefined>;
    remove(id: string): Promise<(D & BaseDoc) | undefined>;
    removeMany(ids: string[]): Promise<(D & BaseDoc)[]>;
    size(): Promise<number>;
}
