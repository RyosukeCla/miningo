const minigo = require('../dist').default
const JsonStorageAdapter = require('../dist/adapters/JsonStorageAdapter').default
const InMemoryAdapter = require('../dist/adapters/InMemoryAdapter').default
const FastStorageAdapter = require('../dist/adapters/FastStorageAdapter').default

const bench = async (name, adapter) => {
  const start = Date.now()
  const db = minigo(adapter)

  await db.drop('bench-data')
  const col = db.collection('bench-data')

  for (let i = 0; i < 1000; i++) {
    await col.insert({ num: i })
  }

  const end = Date.now()
  console.log(name, end - start)
}

const main = async () => {
  await bench('InMemoryAdapter', new InMemoryAdapter())
  await bench('JsonStorageAdapter', new JsonStorageAdapter('./data'))
  await bench('FastStorageAdapter', new FastStorageAdapter('./data'))
}

main()
