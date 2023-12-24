
/*-----Server Setups-----*/
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const {SERVER_PORT} = process.env

app.use(express.json())
app.use(cors())

const { seed, register, login, submitTask, getUsersTasks, completeTask, deleteTask } = require('./controller')

app.use(express.static(`${__dirname}/public`))

/*-----Calls SQL Functions-----*/
app.post('/seed', seed)

app.post('/register', register)
app.post('/login', login)
app.post('/submit-task', submitTask)
app.post('/getUsersTasks', getUsersTasks)
app.post('/complete-task', completeTask)
app.post('/delete-task', deleteTask)

/*-----Starts Server-----*/
app.listen(SERVER_PORT, () => console.log(`Up on ${SERVER_PORT}`))