

/*------Global Variables-------*/
const breakpoint = () => alert('Breakpoint')
let usersEmail = ""
let dateToEdit = ""
let taskEditorOpen = false
let loginFormOpen = true
let homePageOpen = false


/*------Login/Register Page-------*/


// Takes in users registration input
async function registerSubmitHandler(e) {
    e.preventDefault()

    const email = document.getElementById('register__email')
    const password = document.getElementById('register__password')
    const password2 = document.getElementById('register__password2')
    const bodyObj = { email: email.value, password: password.value }
    const clearInputFields = () => { 
        password.value = '' 
        password2.value = ''
    }

    if (!email.value || !password.value || !password2.value) {
        alert('Please fill out required fields')
    } else {
        try { 
            const res = await axios.post('http://localhost:8000/login', bodyObj)
            const emailRes = res.data[0]

            if (typeof emailRes !== 'undefined') {
                alert('User already registered')
                email.value = '' 
                clearInputFields()
            } else if (password.value !== password2.value) {
                alert('Passwords do not match')
                clearInputFields()
            } else if (password.value.length < 6) {
                alert('Password must be at least 6 characters long')
                clearInputFields()
            } else if (!email.value.includes('@') || !email.value.includes('.')) {
                alert('Please enter a valid email address')
                email.value = '' 
                clearInputFields()
            } else {
                try { 
                    await axios.post('http://localhost:8000/register', bodyObj) 
                    alert('Successfully registered')
                    usersEmail = bodyObj.email
                    openHomePage()
                } catch (err) { console.error('Error registering', err) }
            }
        } catch (err) { console.error('Error testing if user is already registered', err) }
    }
}



// Takes users login input and sends it to the SQL database
async function loginSubmitHandler(e) {
    e.preventDefault()

    const emailInput = document.getElementById('login__email')
    const passwordInput = document.getElementById('login__password')
    const bodyObj = { email: emailInput.value, password: passwordInput.value }

    if (!emailInput.value || !passwordInput.value) {
        alert('Please fill out reguired fields')
    } else {
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
}




/*-----Home Page-----*/

// deletes given task from the SQL database
async function deleteTask(task_id, date) {

    bodyObj = { task_id: task_id }
    try { await axios.post(`http://localhost:8000/delete-task`, bodyObj) }
    catch (err) { console.log(err) }
    openHomePage()
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
                <td>${todos[i].description}</td>
                <td>${todos[i].completed ? 'Completed' : 'Incomplete'}</td>
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
    } else { 
        document.getElementById('edit-form').remove()
    }

    dateToEdit = date
    taskEditorOpen = true
    document.body.innerHTML = `
        <div id="edit-form"><div class="container"><header id="edit-tasks-header"><h1>Add Task</h1>
        <div class="alert-message"></div>
        <div class="input-section">
            <input id="task-input" type="text" placeholder=". . ." class="input input-bordered input-secondary w-full max-w-xs" />           
             <button id="add-task-button" onclick="submitTask()"><i class="bx bx-plus bx-sm"></i></button>
        </div>
        <button id="cancel" onclick="openHomePage()">Back</button>
        </header>
        </div>` 
}


// Submits a task the SQL database
async function submitTask() {

    const taskDesc = document.getElementById('task-input')
    const bodyObj = { email: usersEmail, taskDesc: taskDesc.value, date: dateToEdit }

    try { await axios.post(`http://localhost:8000/submit-task`, bodyObj) 
        taskDesc.value = ''
    } catch (err) { console.log('Error adding task', err) }
    
}


// Opens up the home page HTML
function openHomePage() {

    if (loginFormOpen) {
        document.querySelector('.align').remove()
        loginFormOpen = false
    } else if (taskEditorOpen) {
        document.getElementById('edit-form').remove()
        taskEditorOpen = false
    }
    document.body.innerHTML = `
        <div id="home-page">
        <div class="container"><header>
        <h2>Daily Routine</h2><button id="edit-tasks" onclick=editTasks('day')><i class="bx bx-plus bx-sm"></i></button></header>
        <table class="table w-full">
        <thead><tr><th>Task</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody id="day-list"></tbody></table></div>
        
        <div class="container"><header>
        <h2>This Week</h2><button id="edit-tasks" onclick=editTasks('week')><i class="bx bx-plus bx-sm"></i></button></header>
        <table class="table w-full">
        <thead><tr><th>Task</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody id="week-list"></tbody></table></div>
        
        <div class="container"><header>
        <h2>This month</h2><button id="edit-tasks" onclick=editTasks('month')><i class="bx bx-plus bx-sm"></i></button></header>
        <table class="table w-full">
        <thead><tr><th>Task</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody id="month-list"></tbody></table></div>
        
        <div class="container"><header>
        <h2>This Year</h2><button id="edit-tasks" onclick=editTasks('year')><i class="bx bx-plus bx-sm"></i></button></header>
        <table class="table w-full">
        <thead><tr><th>Task</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody id="year-list"></tbody></table></div>`
    homePageOpen = true

    getUsersTasks('day')
    getUsersTasks('week')
    getUsersTasks('month')
    getUsersTasks('year')
}

function openLoginForm(e) {
    e.preventDefault();

    document.querySelector('.align').remove()
    document.body.innerHTML = `
        <div id="login" class="align"></div><div class="grid"><h1> Organizer </h1><h3> Login </h3><form class="form login">
        <div class="form__field">
            <label for="login__email"><svg class="icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#user"></use></svg><span class="hidden">Email</span></label>
            <input id="login__email" type="text" name="email" class="form__input" placeholder="Email" required>
        </div>
        <div class="form__field">
            <label for="login__password"><svg class="icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#lock"></use></svg><span class="hidden">Password</span></label>
            <input id="login__password" type="password" name="password" class="form__input" placeholder="Password" required>
        </div>
        <input onclick="loginSubmitHandler(event)" type="submit" value="Sign In">
        <p class="text--center">Not registered?    <a id="open-register-btn" href="" id="register__link"> Register now</a></p>
        <svg xmlns="http://www.w3.org/2000/svg" class="icons"><symbol id="arrow-right" viewBox="0 0 1792 1792"><path d="M1600 960q0 54-37 91l-651 651q-39 37-91 37-51 0-90-37l-75-75q-38-38-38-91t38-91l293-293H245q-52 0-84.5-37.5T128 1024V896q0-53 32.5-90.5T245 768h704L656 474q-38-36-38-90t38-90l75-75q38-38 90-38 53 0 91 38l651 651q37 35 37 90z"/></symbol><symbol id="lock" viewBox="0 0 1792 1792"><path d="M640 768h512V576q0-106-75-181t-181-75-181 75-75 181v192zm832 96v576q0 40-28 68t-68 28H416q-40 0-68-28t-28-68V864q0-40 28-68t68-28h32V576q0-184 132-316t316-132 316 132 132 316v192h32q40 0 68 28t28 68z"/></symbol><symbol id="user" viewBox="0 0 1792 1792"><path d="M1600 1405q0 120-73 189.5t-194 69.5H459q-121 0-194-69.5T192 1405q0-53 3.5-103.5t14-109T236 1084t43-97.5 62-81 85.5-53.5T538 832q9 0 42 21.5t74.5 48 108 48T896 971t133.5-21.5 108-48 74.5-48 42-21.5q61 0 111.5 20t85.5 53.5 62 81 43 97.5 26.5 108.5 14 109 3.5 103.5zm-320-893q0 159-112.5 271.5T896 896 624.5 783.5 512 512t112.5-271.5T896 128t271.5 112.5T1280 512z"/></symbol></svg>`
        document.getElementById('open-register-btn').addEventListener('click', openRegisterForm)
}

function openRegisterForm(e) {
    e.preventDefault();

    document.querySelector('.align').remove()
    document.body.innerHTML = `
        <div id="login" class="align"></div><div class="grid"><h1> Organizer </h1><h3> Register </h3><form class="form login">
        <div class="form__field">
            <label for="register__email"><svg class="icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#user"></use></svg><span class="hidden">Email</span></label>
            <input id="register__email" type="text" name="email" class="form__input" placeholder="Email" required>
        </div>
        <div class="form__field">
            <label for="register__password"><svg class="icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#lock"></use></svg><span class="hidden">Password</span></label>
            <input id="register__password" type="password" name="password" class="form__input" placeholder="Password" required>
        </div>
        <div class="form__field">
            <label for="register__password2"><svg class="icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#lock"></use></svg><span class="hidden">Re-enter password</span></label>
            <input id="register__password2" type="password" name="password" class="form__input" placeholder="Password" required>
        </div>
        <input onclick="registerSubmitHandler(event)" type="submit" value="Register">
        </form><p class="text--center"><a href="" id="back-login"> Back to Login</a></p></div>
        <svg xmlns="http://www.w3.org/2000/svg" class="icons"><symbol id="arrow-right" viewBox="0 0 1792 1792"><path d="M1600 960q0 54-37 91l-651 651q-39 37-91 37-51 0-90-37l-75-75q-38-38-38-91t38-91l293-293H245q-52 0-84.5-37.5T128 1024V896q0-53 32.5-90.5T245 768h704L656 474q-38-36-38-90t38-90l75-75q38-38 90-38 53 0 91 38l651 651q37 35 37 90z"/></symbol><symbol id="lock" viewBox="0 0 1792 1792"><path d="M640 768h512V576q0-106-75-181t-181-75-181 75-75 181v192zm832 96v576q0 40-28 68t-68 28H416q-40 0-68-28t-28-68V864q0-40 28-68t68-28h32V576q0-184 132-316t316-132 316 132 132 316v192h32q40 0 68 28t28 68z"/></symbol><symbol id="user" viewBox="0 0 1792 1792"><path d="M1600 1405q0 120-73 189.5t-194 69.5H459q-121 0-194-69.5T192 1405q0-53 3.5-103.5t14-109T236 1084t43-97.5 62-81 85.5-53.5T538 832q9 0 42 21.5t74.5 48 108 48T896 971t133.5-21.5 108-48 74.5-48 42-21.5q61 0 111.5 20t85.5 53.5 62 81 43 97.5 26.5 108.5 14 109 3.5 103.5zm-320-893q0 159-112.5 271.5T896 896 624.5 783.5 512 512t112.5-271.5T896 128t271.5 112.5T1280 512z"/></symbol></svg>`
        document.getElementById('back-login').addEventListener('click', openLoginForm)
}

document.getElementById('login-btn').addEventListener('click', loginSubmitHandler)
document.getElementById('open-register-btn').addEventListener('click', openRegisterForm)
