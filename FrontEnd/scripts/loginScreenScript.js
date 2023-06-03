$("#changeForm").click(function () {
    loginContainer = $("#loginContainer");
    registerContainer = $("#registrationContainer");

    loginContainer.toggleClass("hidden");
    registerContainer.toggleClass("hidden");

    this.innerHTML = loginContainer.hasClass("hidden") ? "Попробовать войти" : "Попробовать зарегистрироваться";
});


function registerNewUser(){
    let login = $("#registrationForm input[name='login']").val();
    let username = $("#registrationForm input[name='username']").val();
    let password = $("#registrationForm input[name='password']").val();
    let passwordRepeat = $("#registrationForm input[name='passwordRepeat']").val();

    if(!login.match(/^[a-zA-Z0-9_]+$/)){
        alert("Логин может содержать только буквы, цифры и _\nСорян, что не предупредили раньше");
        return;
    }

    if(password !== passwordRepeat){
        alert("Пароли не совпадают!");
        return;
    }

    //sending request to server and storing jwt token
    register(login, password, username).then((data) => {
        loginRequest(login, password).then((data) => { //when registered log in instantly
            manageLogIn(data);
        }).catch((err) => {
            alert("Ошибка входа!");
            console.error(err);
        });
    }).catch((err) => {
        alert("Ошибка регистрации!");
        console.error(err);
    });
}

function loginUser(){
    let login = $("#loginForm input[name='login']").val();
    let password = $("#loginForm input[name='password']").val();

    loginRequest(login, password).then((data) => {
        manageLogIn(data);
    }).catch((err) => {
        alert("Ошибка входа!");
        console.error(err);
    });
}

function manageLogIn(data){
    if(data.success){
        localStorage.setItem("queueManagerToken", data.message);
        window.location.href = "accountPage.html";
    }
    else{
        err = data.message;
        alert("Ошибка входа!\n" + err);
    }
}