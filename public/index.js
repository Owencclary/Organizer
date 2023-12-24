
/*------Global Variables-------*/
const breakpoint = () => alert('Breakpoint')
let usersEmail = ""
let dateToEdit = ""
let taskEditorOpen = false
let loginFormOpen = true
let homePageOpen = false
let registerFormOpen = false



/*------Login/Register Page-------*/


// Takes in users registration input
async function registerSubmitHandler(e) {
    e.preventDefault()

    let email = document.querySelector('#register__email')
    let password = document.querySelector('#register__password')
    let password2 = document.querySelector('#register__password-2')
    let alreadyRegistered = false
    let bodyObj = { email: email.value, password: password.value }

    axios.post('http://localhost:8000/login', bodyObj)
    .then(res => { const email = res.data[0].email
        if (email !== 'undefined') {
            alreadyRegistered = true
    }})

    try {
        await axios.post('http://localhost:8000/register', bodyObj);
        alert('successfully registered');
        usersEmail = bodyObj.email;
        openHomePage();
    } catch (error) {
        console.error(error);
    }
    email.value = ''
    password.value = ''
    password2.value = '' 
}


// Takes users login input and sends it to the SQL database
async function loginSubmitHandler(e) {
    e.preventDefault()

    let emailInput = document.getElementById('login__email')
    let passwordInput = document.getElementById('login__password')
    let bodyObj = { email: emailInput.value, password: passwordInput.value }

    try {
        const res = await axios.post('http://localhost:8000/login', bodyObj)
        const email = res.data[0].email;
        const password = res.data[0].password;

        if (!email || !password) {
            alert('Invalid email or password');
            emailInput.value = ''
            passwordInput.value = ''
        } else {
            usersEmail = bodyObj.email;
            openHomePage();
        }
    } catch (error) {
        console.error(error);
    }
}




/*-----Home Page-----*/

// deletes given task from the SQL database
async function deleteTask(task_id, date) {

    bodyObj = { task_id: task_id }
    try { await axios.post(`http://localhost:8000/delete-task`, bodyObj) }
    catch (err) { console.log(err) }
    editTasks(date)
}


// Marks a routine task as completed
async function completeTask(task_id) {

    bodyObj = { task_id: task_id }
    try { await axios.post(`http://localhost:8000/complete-task`, bodyObj) }
    catch (err) { console.log(err) }
    openHomePage()
}


// Gets all tasks from the SQL database that are for this user
async function getUsersTasks(date) {
    const list = document.getElementById(`${date}-list`);
    const bodyObj = { email: usersEmail, date: date };

    try {
        const response = await axios.post(`http://localhost:8000/getUsersTasks`, bodyObj);
        const todos = response.data;

        if (todos.length === 0) {
            list.innerHTML = `<tr><td colspan="5" class="text-center">No task found</td></tr>`;
            return;
        }
        list.innerHTML = "";
        for (let i = 0; i < todos.length; i++) {
            list.innerHTML += `
            <tr class="todo-item" data-id="${todos[i].task_id}">
                <td>${todos[i].taskDesc}</td>
                <td>${todos[i].completed}</td>
                <td>
                    <button class="btn btn-success btn-sm" onclick="completeTask(${todos[i].task_id})">
                        <i class="bx bx-check bx-xs"></i>
                    </button>
                    <button class="btn btn-error btn-sm" onclick="deleteTask(${todos[i].task_id}, '${date}')">
                        <i class="bx bx-trash bx-xs"></i>
                    </button>
                </td>
            </tr>`;
        }
    } catch (err) {
        console.error(err);
    }
}



// Opens up the edit routine HTML to add and delete tasks
function editTasks(date) {

    if (homePageOpen) {
        document.getElementById('home-page').remove()
        homePageOpen = false
    }
    
    dateToEdit = date
    taskEditorOpen = true
    document.body.innerHTML = `
        <div id="edit-form"><div class="container"><header><h1>Add Task</h1>
        <div class="alert-message"></div>
        <div class="input-section">
            <input type="text" placeholder="Add a todo . . ." class="input input-bordered input-secondary w-full max-w-xs" />            <button id="add-task-button">
                <i class="bx bx-plus bx-sm"></i>
            </button>
        </div>
        <button id="cancel" onclick="openHomePage()">Cancel</button>
        </header>
        </div>`
    getUsersTasks(dateToEdit)
}


// Submits a task the SQL database
async function submitTask() {

    taskDesc = document.querySelector('#taskDescription').value
    let bodyObj = { email: usersEmail, taskDesc: taskDesc, date: dateToEdit }

    try { await axios.post(`http://localhost:8000/submit-task`, bodyObj) }
    catch (err) { console.log(err) }
    editTasks(dateToEdit)
}


// Opens up the home page HTML
function openHomePage() {

    if (loginFormOpen || registerFormOpen) {
        document.querySelector('.grid').remove()
        loginFormOpen = false
        registerFormOpen = false
    } else if (taskEditorOpen) {
        document.getElementById('edit-form').remove()
        taskEditorOpen = false
    }
    document.body.innerHTML = `
        <div id="home-page">
        <div class="container"><header>
        <h2>Routine</h2><button id="edit-tasks" onclick=editTasks('day')><i class="bx bx-plus bx-sm"></i></button>
        <table class="table w-full">
        <thead><tr><th>Task</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody id="day-list"></tbody></table></div>
        
        <div class="container"><header>
        <h2>Routine</h2><button id="edit-tasks" onclick=editTasks('week')><i class="bx bx-plus bx-sm"></i></button>
        <table class="table w-full">
        <thead><tr><th>Task</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody id="week-list"></tbody></table></div>
        
        <div class="container"><header>
        <h2>Routine</h2><button id="edit-tasks" onclick=editTasks('month')><i class="bx bx-plus bx-sm"></i></button>
        <table class="table w-full">
        <thead><tr><th>Task</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody id="month-list"></tbody></table></div>
        
        <div class="container"><header>
        <h2>Routine</h2><button id="edit-tasks" onclick=editTasks('year')><i class="bx bx-plus bx-sm"></i></button>
        <table class="table w-full">
        <thead><tr><th>Task</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody id="year-list"></tbody></table></div>`
    homePageOpen = true

    getUsersTasks('day')
    getUsersTasks('week')
    getUsersTasks('month')
    getUsersTasks('year')
}


/*------Event Listeners-------*/

//document.getElementById('register-btn').addEventListener('click', registerSubmitHandler)
document.getElementById('login-btn').addEventListener('click', loginSubmitHandler)