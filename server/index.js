
/*-----Server Setup-----*/
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const {SERVER_PORT} = process.env

app.use(express.json())
app.use(cors())

const { seed, resetRefreshDate, getRefreshDate, deleteAllTasks, markTasksUncomplete, register, login, submitTask, getUsersTasks, completeTask, deleteTask } = require('./controller')

app.use(express.static(`${__dirname}/public`))


/*-----Calls SQL Functions-----*/
app.post('/seed', seed)
app.get('/refresh-check', getRefreshDate)
app.get('/reset-refresh-date', resetRefreshDate)
app.post('/register', register)
app.post('/delete-all-tasks', deleteAllTasks)
app.post('/mark-tasks-uncomplete', markTasksUncomplete)
app.post('/login', login)
app.post('/submit-task', submitTask)
app.post('/getUsersTasks', getUsersTasks)
app.post('/complete-task', completeTask)
app.post('/delete-task', deleteTask)


/*-----Starts Server-----*/
app.listen(SERVER_PORT, () => console.log(`Up on ${SERVER_PORT}`))