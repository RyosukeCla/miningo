import Collection from './collection';
import DatabaseAdapter from './adapter';
export default class Database {
    private adapter;
    constructor(adapter: DatabaseAdapter);
    collection<D>(name: string, schema?: any): Collection<D>;
    drop(name: string): Promise<void>;
}
