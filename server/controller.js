/*-----SQL Setup-----*/
require('dotenv').config()
const {CONNECTION_STRING} = process.env
const Sequelize = require('sequelize')
const sequelize = new Sequelize(CONNECTION_STRING)

/*-----Controller SQL Functions-----*/
module.exports = {

    // Sets the selected taks as completed so the checkbox will be stayed checked
    completeTask: (req, res) => {
        const { task_id } = req.body;
        sequelize.query(`
            UPDATE tasks
            SET completed = TRUE
            WHERE task_id = '${task_id}';
        `).then(dbRes => res.status(200).send(dbRes))
       .catch(err => console.log(err))
    },

    // Removes given tasks from the SQL database
    deleteTask: (req, res) => {
        const { task_id } = req.body;
        sequelize.query(`
            DELETE FROM tasks
            WHERE task_id = ${task_id};
        `).then(dbRes => res.status(200).send(dbRes))
       .catch(err => console.log(err))
    },

    // Gets users tasks from the SQL database
    getUsersTasks: (req, res) => {
        const { email, date } = req.body;
        sequelize.query(`
            SELECT * FROM tasks
            WHERE users_email = '${email}' AND active_date = '${date}';
        `).then(dbRes => res.status(200).send(dbRes[0]))
       .catch(err => console.log(err))
    },

    // Submits a task to the SQL database with the according users email, active date, and a description
    submitTask: (req, res) => {
        const { email, taskDesc, date } = req.body;
        sequelize.query(`
            INSERT INTO tasks (users_email, active_date, description, completed)
            VALUES (
            '${email}',
            '${date}',
            '${taskDesc}',
            FALSE
            )
        `).then(dbRes => res.status(200).send(dbRes))
        .catch(err => console.log(err))
    },

    // Tries to get SQL login info where the given username and password matcb
    login: (req, res) => {
        const { email, password } = req.body;
        sequelize.query(`
            SELECT * FROM users
            WHERE email = '${email}'
            AND password = '${password}';
        `).then(dbRes => res.status(200).send(dbRes[0]))
        .catch(err => console.log(err))
    },

    // Inserts given user info into the SQL database
    register: (req, res) => {
        const { email, password } = req.body;
        sequelize.query(`
            INSERT INTO users (email, password)
            VALUES (
                '${email}',
                '${password}'
            )   
        `).then(dbRes => res.status(200).send(dbRes)
        ).catch(err => console.log('Error adding user', err)) 
    },

    // Seeds the SQL database
    seed: (req, res) => {
        sequelize.query(`
        CREATE TABLE users (
            user_id SERIAL PRIMARY KEY,
            email VARCHAR(255),
            password VARCHAR(255)
        );
        CREATE TABLE tasks (
            task_id SERIAL PRIMARY KEY,
            users_email VARCHAR(255),
            active_date VARCHAR(255),
            description VARCHAR(255),
            completed BOOLEAN
        );
        `).then(() => {
            console.log('User Seeded!')
            res.sendStatus(200)
        }).catch(err => console.log('error seeding DB', err))
    }
}