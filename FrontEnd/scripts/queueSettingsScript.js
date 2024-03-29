let url = new URL(window.location.href);
let id = url.searchParams.get("id");


function generateQueuedPeopleListElement(person, index){
    let name = person.login;
    if (person.type == 'SITE'){
        name = usernameByLogin[person.login];
    }
    if (person.type == 'VK') {
        name = person.username;
    }

    let list = $("#membersList");
    if(person.frozen){
        let addingElement = $("<li>\
                            <h2>" + (index+1) + "</h2>\
                            <h3>" + name + "</h3>\
                            <h4>заморожен</h4>\
                        </li>");
        list.append(addingElement);
    }
    else{
        let addingElement = $("<li>\
                            <h2>" + (index+1) + "</h2>\
                            <h3>" + name + "</h3>\
                        </li>");
        list.append(addingElement);
    }
    //console.log(queuedPeople);
    // console.log(list);
    // console.log(addingElement);

}

function queuedPeopleGenerate(queuedPeople){ //used in updating the list (but not the first time)
    //clear the list
    $("#membersList").empty();
    //generate the list
    queuedPeople.forEach((person, index) => {
        generateQueuedPeopleListElement(person, index);
    });
}

async function firstListGeneration(queuedPeople){ //used in generating the list for the first time

    const promises = queuedPeople.map((person) => {
        if(person.type == 'SITE'){
            return getUserByLogin(person.login)
                .then((user) => {
                    usernameByLogin[person.login] = user.username;
                });
        }
        else{
            return Promise.resolve();
        }
      });
    
      await Promise.all(promises);
      queuedPeopleGenerate(queuedPeople);
}



//first time queue generation

let queuedPeople = [];
let usernameByLogin = {};
getQueueById(id).then((queue) => {
    //console.log(queue);
    $("#queueName").text(queue.name);
    queuedPeople = queue.queuedPeople;
    firstListGeneration(queuedPeople);
});


// hiding buttons for non logged users
function hideButtons(){
    let token = localStorage.getItem("queueManagerToken");
    if(token != null &&  isTokenExpired(decodeJwt(token).exp)){
        localStorage.removeItem("queueManagerToken");
        token = null;
    }
    if(token == null){
        $("#leaveQueue").addClass("hidden");
        $("#freezeSelf").addClass("hidden");
    }
}
hideButtons();

// checking if logged user is frozen
function checkFrozen(){
    let token = localStorage.getItem("queueManagerToken");
    if(token != null &&  isTokenExpired(decodeJwt(token).exp)){
        localStorage.removeItem("queueManagerToken");
        token = null;
    }
    if(token != null){
        freezeBtn = $("#freezeSelf");
        let userLogin = decodeJwt(token).login;
        getQueueById(id).then((queue) => {
            queue.queuedPeople.forEach((person) => {
                if(person.login == userLogin){
                    if(person.frozen){
                        freezeBtn.text("Разморозиться");
                    }
                    else{
                        freezeBtn.text("Заморозиться");
                    }
                }
            });
        });
    }
}
checkFrozen();



//------------------//
// button handlers
//------------------//

// enter queue handler
$("#enterQueue").click(() => {
    let token = localStorage.getItem("queueManagerToken");
    if(token != null && isTokenExpired(decodeJwt(token).exp)){
        localStorage.removeItem("queueManagerToken");
        token = null;
    }

    if(token != null){
        loginEnter(token);
    }
    else{
        noLoginEnter();
    }
});

function noLoginEnter(){
    let name = prompt("Please enter your name\nNote that you won't be able to leave queue", "Akakiy Akakievich");
    if(name != null){
        enterQueueNoLogin(id, name);
    }
    else{
        alert("You must enter your name to enter the queue");
    }
}

function loginEnter(token){
    enterQueue(id, token).then((data) => {
        if(!data.success){
            alert("Вы уже в очереди");
        }
    });
}


// leave queue handler
$("#leaveQueue").click(() => {
    let token = localStorage.getItem("queueManagerToken");
    if(token != null &&  isTokenExpired(decodeJwt(token).exp)){
        localStorage.removeItem("queueManagerToken");
        token = null;
    }
    if(token == null){
        alert("You must be logged in to leave the queue");
        return;
    }
    leaveQueue(id, token);
});


// freeze button handler
$("#freezeSelf").click(() => {
    let token = localStorage.getItem("queueManagerToken");
    if(token != null &&  isTokenExpired(decodeJwt(token).exp)){
        localStorage.removeItem("queueManagerToken");
        token = null;
    }
    if(token == null){
        alert("You must be logged in to freeze yourself");
        return;
    }
    freezeUser(id, token);
});


//kick first handler
$("#popFirstOne").click(() => {
    popFirstOne(id);
});


//------------------//
// end of button handlers
//------------------//



//subscribe using EventSource
let eventSource = new EventSource(ip + "/queue/" + id + "/subscribe");
eventSource.onmessage = function(event){
    let data = JSON.parse(event.data);
    //console.log(data);

    if(data.op == "update"){
        let update = data.update;
        let updateKey = Object.keys(update)[0];
        let updateValue = update[updateKey];
        if(updateKey.indexOf(".") != -1){
            // update: queuedPeople.0 : {}
            let updateKeySplit = updateKey.split(".");
            let updateKeyIndex = updateKeySplit[1];
            queuedPeople[updateKeyIndex] = updateValue;

            //updating list of usernames
            getUserByLogin(updateValue.login).then((user) => {
                usernameByLogin[updateValue.login] = user.username; 
                queuedPeopleGenerate(queuedPeople);
            });
        }
        else{
            // update: queuedPeople : []
            queuedPeople = updateValue;
        }
        
        queuedPeopleGenerate(queuedPeople);
    }
}