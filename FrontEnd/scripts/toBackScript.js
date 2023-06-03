let ip = "http://localhost:8000"

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

function register(name, password){
    return new Promise((resolve, reject) => {
        $.ajax({
            url: ip + "/users",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                command: "create",
                arguments: {
                    login: name, password: password
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