# Miningo
Tiny embedding document-oriented database written in typescript.

- For playground / experimental / simple / application use.
- For who not want to use mongodb / redis / postgress, but want to use database.

## installation
```
$ npm i miningo
```

## API
### import
- esmodule / ts
```js
import miningo from 'miningo'
```

- commonjs
```js
const miningo = require('miningo').default
```

### create client
```ts
const db = miningo()
```

### create client with adapter
```ts
// default
import InMemoryAdapter from 'miningo/adapters/InMemoryAdapter'
const db = miningo(new InMemoryAdapter())

// persistent json storage. save json to dataDir.
import JsonStorageAdapter from 'miningo/adapters/JsonStorageAdapter'
const db = miningo(new JsonStorageAdapter('./data'))

// persistent local storage for browser.
import LocalStorageAdapter from 'miningo/adapters/LocalStorageAdapter'
const namespace = 'test'
const db = miningo(new LocalStorageAdapter(namespace))
```

### create or get collection
```ts
interface Human {
  name: string
}

const Human = db.collection<Human>('Human')
// or you can use json schema
const Human = db.collection<Human>('Human', {
  name: { type: 'string' }
})
```

### drop collection
```ts
await Human.drop()
```

### insert document
```ts
const you = await Human.insert({ name: 'you' })
```

### insert documents
```ts
const [you, me] = await Human.insertMany([{ name: 'you' }, { name: 'me' }])
```

### find document
```ts
const doc = await Human.find(you._id)
```

### find all documents
```ts
const doc = await Human.findAll()
```

### find documents by ids
```ts
const docs = await Human.findMany([you._id, me._id])
```

### find documents by very simple query (not support operators such as $or, $in ...)
```ts
const you = await Human.findBy({ name: 'you' })
```

### update document
```ts
const updated = await Human.update(you._id, { name: 'me' })
```

### remove document
```ts
const removed = await Human.remove(you._id)
```

### remove documents
```ts
const removed = await Human.removeMany([you._id, me._id])
```

### collection size
```ts
await Human.size()
```

