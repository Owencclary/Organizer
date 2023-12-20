
/*------Global Variables-------*/
const registerForm = document.querySelector('#register-form')
const loginForm = document.querySelector('#login-form')
const checkbox = document.querySelectorAll('checkbox')
let usersEmail = ""
let dateToEdit = ""
let taskEditorOpen = false


/*------Login/Register Page-------*/

// Takes in users registration input
function registerSubmitHandler(e) {
    e.preventDefault()

    // Variables for HTML elements
    let email = document.querySelector('#register-email')
    let password = document.querySelector('#register-password')
    let password2 = document.querySelector('#register-password-2')

    // Tests if email is valid and passwords match or are long enough
    if (password.value !== password2.value) {
        alert('Passwords do not match')
    } else if (password.value.length < 6) {
        alert('Password must be at least 6 characters long')
    } else if (!email.value.includes('@') || !email.value.includes('.')) {
        alert('Please enter a valid email address');
    } else {

        // Variables for user info
        let bodyObj = {
            email: email.value,
            password: password.value
        }

        // Sends registration info to the SQL database then opens up the home page HTML
        axios.post('http://localhost:4004/register', bodyObj)
            .then(res => {
                alert('successfully registered')
                usersEmail = bodyObj.email
                openHomePage()
        })
    }  
    // Clears the input fields
    email.value = ''
    password.value = ''
    password2.value = '' 
}

// Takes users login input and sends it to the SQL database
function loginSubmitHandler(e) {
    e.preventDefault()

    // Variables for HTML elements and login info
    let email = document.querySelector('#login-email')
    let password = document.querySelector('#login-password')
    let bodyObj = {
        email: email.value,
        password: password.value
    }

    // Posts login info to the SQL database then returns what it finds
    axios.post('http://localhost:4004/login', bodyObj)
        .then(res => {
            const email = res.data[1]
            const password = res.data[2]

            // Tests if users login credentials were found in the database
            if (typeof email === 'undefined' || typeof password === 'undefined') {
                alert('Invalid email or password')
            } else {

                // Opens up the home page HTML if user is vald
                usersEmail = bodyObj.email
                openHomePage()
            }
    })
    // Clears the input fields
    email.value = ''
    password.value = ''
}




/*-----Home Page-----*/

// deletes given task from the SQL database
function deleteTask(task_id, date) {

    // Variables for what task to complete
    bodyObj = {
        task_id: task_id
    }

    // Posts what task to delete from the SQL database
    axios.post(`http://localhost:4004/delete-task`, bodyObj)
    .then(console.log('Task Deleted')).catch(err => console.log(err))

    // Opens up the home page HTML if not in routine editor
    editTasks(date)
}


// Marks a routine task as completed
function completeTask(task_id) {

    // Variables for what task to complete
    bodyObj = {
        task_id: task_id
    }

    // Posts what task to delete from the SQL database
    axios.post(`http://localhost:4004/complete-task`, bodyObj)
    .then(openHomePage()).catch(err => console.log(err))
}


// Gets all tasks from the SQL database that are for this user
function getUsersTasks(date, element) {

    // Variables for what task to get from the SQL database 
    const bodyObj = { 
        email: usersEmail,
        date: date
    }

    // Posts what task to get from the SQL database
    axios.post(`http://localhost:4004/getUsersTasks`, bodyObj).then(res => {

        // Loop over all tasks from the SQL database and add each on to the HTML list
        for (let i = 0; i < res.data.length; i++) {

            // Creates a list item for each task from the SQL database
            const task = document.createElement("li");
            task.textContent = res.data[i].description;
            const taskList = document.getElementById(`${element}`);
            taskList.appendChild(task);

            // Adds a delete function or a check if the task editor is open or not
            if (taskEditorOpen) {   
                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = 'Delete';
                deleteBtn.addEventListener('click', function() {
                    deleteTask(res.data[i].task_id, date);
                });
                taskList.appendChild(deleteBtn);

            // Creates a checkbox for each task and adds it to the HTML list
            } else {
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.addEventListener('click', function() {
                    completeTask(res.data[i].task_id);
                });
                taskList.appendChild(checkbox);
                
                // Marks checkboxes as completed if they are completed
                if (res.data[i].completed) {
                    checkbox.checked = true
                }
            }
        }
    }).catch(err => console.log(err))
}


// Opens up the edit routine HTML to add and delete tasks
function editTasks(date) {

    // Variable for what date to edit
    dateToEdit = date
    taskEditorOpen = true

    // Creates HTML for editing routine
    document.body.innerHTML = `
        <form><h6>Add Task</h6>
        <label for="taskDescription">Description:</label>
        <input type="text" id="taskDescription" name="taskDescription">
        <br><br>
        <button onclick="submitTask()">Add Task</button></form>
        <br><br>
        <h6>Remove Task</h6>
        <ul id="tasks"></ul><button onclick="openHomePage()">Back</button>`

    // Loads the tasks for the daily routine where you can remove them
    getUsersTasks(dateToEdit, 'tasks')
}


// Submits a task the SQL database
function submitTask() {

    // Variables for task to submit and input field HTML
    taskDesc = document.querySelector('#taskDescription').value
    let bodyObj = {
        email: usersEmail,
        taskDesc: taskDesc,
        date: dateToEdit
    }

    // Post data to SQL database
    axios.post(`http://localhost:4004/submit-task`, bodyObj)
    .then(editTasks(dateToEdit)).catch(err => console.log(err))
}


// Opens up the home page HTML
function openHomePage() {

    // Removes the login and register forms from the HTML and turns routine edito open off
    loginForm.remove()
    registerForm.remove()
    taskEditorOpen = false

    // Creates HTML for home page
    document.body.innerHTML = `
    <div id="home-page">
    <form id="day-form">
    <h4>Daily Routine</h4><ul id="day-tasks"></ul>
    <button onclick="editTasks('day')">Edit Routine</button></form>
    <form id="week-form">
    <h4>To Do this Week</h4><ul id="week-tasks"></ul>
    <button onclick="editTasks('week')">Edit Tasks</button></form>
    <form id="month-form">
    <h4>This Months Goals</h4><ul id="month-tasks"></ul>
    <button onclick="editTasks('month')">Add Goal</button></form>
    <form id="Year-form">
    <h4>This Years Goals</h4><ul id="year-tasks"></ul>
    <button onclick="editTasks('year')">Add Goal</button></form>
    </div>`

    // Loads the tasks for day, week, month, and year and the according HTML element to append them too
    getUsersTasks('day', 'day-tasks')
    getUsersTasks('week', 'week-tasks')
    getUsersTasks('month', 'month-tasks')
    getUsersTasks('year', 'year-tasks')
}
 

/*------Event Listeners-------*/

registerForm.addEventListener('submit', registerSubmitHandler)
loginForm.addEventListener('submit', loginSubmitHandler)
