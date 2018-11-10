import DatabaseFactory from '../src/index'
import DatabaseAdapter from '../src/adapter'
import InMemoryAdapter from '../src/adapters/InMemoryAdapter'
import JsonStorageAdapter from '../src/adapters/JsonStorageAdapter'

interface Human {
  name: string,
  age: number
}

const fakeHuman = { name: 'RyosukeCla', age: 22 }
const fakeHumans_1000 = []
const fakeHumans_20y = []
for (let i = 0; i < 1000; i++) {
  const name = 'type-' + Math.trunc(Math.random() * 4)
  const age = Math.trunc(Math.random() * 10 + 20)
  const doc = { name, age }
  fakeHumans_1000.push(doc)
  if (age === 25 && name === 'type-0') fakeHumans_20y.push(doc)
}

const schema = {
  name: {
    type: 'string',
    required: true
  },
  age: {
    type: 'integer',
    minimum: 0,
    maximum: 100,
    required: true
  }
}

const testAdapter = (adapter: DatabaseAdapter) => () => {
  const db = DatabaseFactory(adapter)
  const Human = db.collection<Human>('human')

  beforeEach(async () => {
    await db.drop('human')
  })

  it('schema', (done) => {
    const HumanWithSchema = db.collection<Human>('human', schema)
    HumanWithSchema.insert({} as any).then(() => {
      done.fail()
    }).catch(e => done())
  })

  it('insert', async () => {
    const me = await Human.insert(fakeHuman)

    expect(me.name).toBe(fakeHuman.name)
    expect(me.age).toBe(fakeHuman.age)
  })

  it('insert each', async () => {
    const items = []
    fakeHumans_20y.forEach((doc) => {
      items.push(Human.insert(doc))
    })

    await Promise.all(items)
    const size = await Human.size()
    expect(size).toBe(fakeHumans_20y.length)
  })

  it('insertMany', async () => {
    const docs = await Human.insertMany(fakeHumans_1000)

    expect(docs.length).toBe(1000)
  })

  it('update', async () => {
    const me = await Human.insert(fakeHuman)
    const updated = await Human.update(me._id, {
      name: 'suzuki',
      age: 30
    })
    const found = await Human.find(me._id)

    expect(found.name).toBe(updated.name)
    expect(found.name).not.toBe(me.name)
    expect(found.age).toBe(updated.age)
    expect(found.age).not.toBe(me.age)
  })

  it('find', async () => {
    const fake = await Human.insert(fakeHuman)
    const found = await Human.find(fake._id)
    expect(found.name).toBe(fakeHuman.name)
    expect(found.age).toBe(fakeHuman.age)
  })

  it('findAll', async () => {
    await Human.insertMany(fakeHumans_1000)
    const founds = await Human.findAll()
    expect(founds.length).toBe(1000)
  })

  it('findBy', async () => {
    await Human.insertMany(fakeHumans_1000)
    const founds = await Human.findBy({
      name: 'type-0',
      age: 25,
    })
    expect(founds.length).toBe(fakeHumans_20y.length)
  })

  it('remove', async () => {
    const fake = await Human.insert(fakeHuman)
    await Human.remove(fake._id)
    const found = await Human.find(fake._id)
    expect(found).toBe(undefined)
  })

  it('removeMany', async () => {
    const fakes = await Human.insertMany(fakeHumans_1000)
    const ids = fakes.map(fake => fake._id)
    await Human.removeMany(ids)
    const founded = await Human.findMany(ids)
    expect(founded.length).toBe(0)
  })

  it('size', async () => {
    await Human.insertMany(fakeHumans_1000)
    const size = await Human.size()
    expect(size).toBe(1000)
  })

  it('drop', async () => {
    await Human.insertMany(fakeHumans_1000)
    await db.drop('human')
    const size = await Human.size()
    expect(size).toBe(0)
  })
}

describe('in memory', testAdapter(new InMemoryAdapter()))
describe('json storage', testAdapter(new JsonStorageAdapter('./data')))
