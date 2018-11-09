import Database from './database'
import DatabaseAdapter from './adapter'
import InMemoryAdapter from './adapters/InMemoryAdapter'

export default function databaseFactory(adapter: DatabaseAdapter = new InMemoryAdapter()) {
  return new Database(adapter)
}
