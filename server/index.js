/*-----Server Setups-----*/
require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const {SERVER_PORT} = process.env
const {seed, register, login, submitTask, getUsersTasks, completeTask, resetRoutine, deleteTask } = require('./controller.js')
app.use(express.json())
app.use(cors())

app.use(express.static(`${__dirname}/public`))

/*-----Calls SQL Functions-----*/
app.post('/seed', seed)

app.post('/register', register)
app.post('/login', login)
app.post('/submit-task', submitTask)
app.post('/getUsersTasks', getUsersTasks)
app.post('/complete-task', completeTask)
app.post('/reset-routine', resetRoutine)
app.post('/delete-task', deleteTask)

/*-----Starts Server-----*/
app.listen(SERVER_PORT, () => console.log(`up on ${SERVER_PORT}`))