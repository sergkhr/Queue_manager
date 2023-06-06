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
    let addingElement = $("<li>\
                            <h2>" + (index+1) + "</h2>\
                            <h3>" + name + "</h3>\
                        </li>");
    list.append(addingElement);

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
        return getUserByLogin(person.login)
          .then((user) => {
            usernameByLogin[person.login] = user.username;
          });
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
    let userLogin = decodeJwt(token).login;
    getUserByLogin(userLogin).then((user) => {
        usernameByLogin[userLogin] = user.username; 
    });
}


// leave queue handler
$("#leaveQueue").click(() => {
    let token = localStorage.getItem("queueManagerToken");
    if(isTokenExpired(decodeJwt(token).exp)){
        localStorage.removeItem("queueManagerToken");
        token = null;
    }
    if(token == null){
        alert("You must be logged in to leave the queue");
        return;
    }
    leaveQueue(id, token);
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
        }
        else{
            // update: queuedPeople : []
            queuedPeople = updateValue;
        }
        
        queuedPeopleGenerate(queuedPeople);
    }
}