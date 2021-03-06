const miningo = require('miningo').default
const FastStorageAdapter = require('miningo/adapters/FastStorageAdapter').default

const main = async () => {
  // persistent storage
  const dataDir = './data'
  const db = miningo(new FastStorageAdapter(dataDir))

  // Todo Collection with validator
  const todoSchema = {
    title: { type: 'string', required: true },
    desc: { type: 'string' }
  }
  const Todo = db.collection('Todo', todoSchema)

  // get todos
  const todos = await Todo.findAll()
  console.log('todos', todos)

  // create todo
  const todo = await Todo.insert({
    title: 'hello, world! - ' + todos.length,
    desc: 'miningo!!'
  })
  console.log('created', todo)
}

main()
