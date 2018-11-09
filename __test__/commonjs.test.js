const minigo = require('../dist').default
const JsonStorageAdapter = require('../dist/adapters/JsonStorageAdapter').default

test('commonjs', (done) => {
  minigo(new JsonStorageAdapter('./data'))
  done()
})
