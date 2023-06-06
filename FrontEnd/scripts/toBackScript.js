let ip = "http://212.109.197.222:8000"



//jwt decoder by gpt
function decodeJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
  
    return JSON.parse(jsonPayload);
}

function isTokenExpired(decodedExp){
    let now = new Date();
    let exp = new Date(decodedExp * 1000);
    return now > exp;
}



function getQueueList(){
    return new Promise((resolve, reject) => {
        $.ajax({
            url: ip + "/queues",
            type: "GET",
            success: function(data){
                resolve(data);
            },
            error: function(err){
                reject(err);
            }
        });
    });
}

function getQueueById(id){
    return new Promise((resolve, reject) => {
        $.ajax({
            url: ip + "/queue/" + id,
            type: "GET",
            success: function(data){
                resolve(data);
            },
            error: function(err){
                reject(err);
            }
        });
    });
}

function getUserByLogin(login){
    return new Promise((resolve, reject) => {
        $.ajax({
            url: ip + "/user/" + login,
            type: "GET",
            success: function(data){
                resolve(data);
            },
            error: function(err){
                reject(err);
            }
        });
    });
}

function getUserByToken(token){
    let userLogin = decodeJwt(token).login;
    return new Promise((resolve, reject) => {
        $.ajax({
            url: ip + "/user/" + userLogin,
            type: "GET",
            success: function(data){
                resolve(data);
            },
            error: function(err){
                reject(err);
            }
        });
    });   
}

function enterQueueNoLogin(id, name){
    return new Promise((resolve, reject) => {
        $.ajax({
            url: ip + "/queue/" + id,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify({
                login: name,
                command: "join"
            }),
            success: function(data){
                resolve(data);
            },
            error: function(err){
                reject(err);
            }
        });
    });
}

function enterQueue(id, token){
    return new Promise((resolve, reject) => {
        $.ajax({
            url: ip + "/queue/" + id,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify({
                command: "join"
            }),
            headers: {
                authorization: token
            },
            success: function(data){
                resolve(data);
            },
            error: function(err){
                reject(err);
            }
        });
    });
}

function leaveQueue(id, token){
    return new Promise((resolve, reject) => {
        $.ajax({
            url: ip + "/queue/" + id,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify({
                command: "leave"
            }),
            headers: {
                authorization: token
            },
            success: function(data){
                resolve(data);
            },
            error: function(err){
                reject(err);
            }
        });
    });
}

function freezeUser(id, token){
    return new Promise((resolve, reject) => {
        $.ajax({
            url: ip + "/queue/" + id,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify({
                command: "freeze"
            }),
            headers: {
                authorization: token
            },
            success: function(data){
                resolve(data);
            },
            error: function(err){
                reject(err);
            }
        });
    });
}

function popFirstOne(id){
    return new Promise((resolve, reject) => {
        $.ajax({
            url: ip + "/queue/" + id,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify({
                command: "pop"
            }),
            success: function(data){
                resolve(data);
            },
            error: function(err){
                reject(err);
            }
        });
    });
}

function register(login, password, username){
    return new Promise((resolve, reject) => {
        $.ajax({
            url: ip + "/users",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                command: "create",
                arguments: {
                    login: login, password: password, username: username
                }
            }),
            success: function(data){
                resolve(data);
            },
            error: function(err){
                reject(err);
            }
        });
    });
}

function loginRequest(name, password){
    return new Promise((resolve, reject) => {
        $.ajax({
            url: ip + "/login",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                login: name, password: password
            }),
            success: function(data){
                resolve(data);
            },
            error: function(err){
                reject(err);
            }
        });
    });
}