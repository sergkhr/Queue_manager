$("#changeForm").click(function () {
    loginContainer = $("#loginContainer");
    registerContainer = $("#registrationContainer");

    loginContainer.toggleClass("hidden");
    registerContainer.toggleClass("hidden");

    this.innerHTML = loginContainer.hasClass("hidden") ? "Попробовать войти" : "Попробовать зарегистрироваться";
});

function registerNewUser(){
    let login = $("#registrationForm input[name='login']").val();
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

    //sendiong request to server and storing jwt token
    register(login, password).then((data) => {
        login(login, password).then((data) => { //when registered log in instantly
            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("login", login);
            window.location.href = "main.html";
        }).catch((err) => {
            alert("Ошибка входа!");
            console.error(err);
        });
    }).catch((err) => {
        alert("Ошибка регистрации!");
        console.error(err);
    });
}