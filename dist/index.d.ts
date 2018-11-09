import Database from './database';
import DatabaseAdapter from './adapter';
export default function databaseFactory(adapter?: DatabaseAdapter): Database;
