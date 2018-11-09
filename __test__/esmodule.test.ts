import minigo from '../dist'
import JsonStorageAdapter from '../dist/adapters/JsonStorageAdapter'

test('esmodule', (done) => {
  minigo(new JsonStorageAdapter('./data'))
  done()
})
