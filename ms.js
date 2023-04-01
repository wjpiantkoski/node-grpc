const grpc = require('grpc')

const todoProto = grpc.load('todo.proto')
const server = new grpc.Server()

const fakeDB = [
  { id: 1, done: false, task: 'Tarefa 01' },
  { id: 2, done: false, task: 'Tarefa 02' }
]

function changeData(id, checked) {
  let res = { id, done: false, task: "" }

  const taskPosition = fakeDB.findIndex(item => item.id === id)

  if (taskPosition > -1) {
    fakeDB[taskPosition].done = checked
    res = fakeDB[taskPosition]
  }

  return res
}

server.addService(todoProto.TodoService.service, {
  insert: (call, cb) => {
    let todo = call.request
    let data = changeData(fakeDB.length + 1, false, todo.task)

    if (todo.task) {
      fakeDB.push(data)
    }

    cb(null, data)
  },
  list: (_, cb) => {
    cb(null, fakeDB)
  },
  mark: (call, cb) => {
    let item = call.request
    cb(null, changeData(item.id, item.checked))
  }
})

let serverAddress = '127.0.0.1:50051'

server.bind(serverAddress, grpc.ServerCredentials.createInsecure())

console.log('Server running at ' + serverAddress)

server.start()