let url = new URL(window.location.href);
let id = url.searchParams.get("id");


function generateQueuedPeopleListElement(person, index){
    let list = $("#membersList");
    let addingElement = $("<li>\
                            <h2>" + (index+1) + "</h2>\
                            <h3>" + person.login + "</h3>\
                        </li>");
    list.append(addingElement);

    //console.log(queuedPeople);
    // console.log(list);
    // console.log(addingElement);

}

function queuedPeopleGenerate(queuedPeople){
    //clear the list
    $("#membersList").empty();
    //generate the list
    queuedPeople.forEach((person, index) => {
        generateQueuedPeopleListElement(person, index);
    });
}


//first time queue generation

queuedPeople = [];
currentQueue = getQueueById(id);
currentQueue.then((queue) => {
    //console.log(queue);
    queuedPeople = queue.queuedPeople;
    queuedPeopleGenerate(queuedPeople);
});



//subscribe using EventSource
let eventSource = new EventSource(ip + "/queue/" + id + "/subscribe");
eventSource.onmessage = function(event){
    let data = JSON.parse(event.data);
    console.log(data);

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



// button handlers

// enter queue handler
$("#enterQueue").click(() => {
    logged = false;
    // TODO: check login

    if(logged){

    }
    else{
        noLoginEnter();
    }
});

function noLoginEnter(){
    let name = prompt("Please enter your name", "Akakiy Akakievich");
    if(name != null){
        let promise = enterQueueNoLogin(id, name);
        promise.then((data) => {
            console.log(data);
        });
    }
    else{
        alert("You must enter your name to enter the queue");
    }
}


//kick first handler
$("#popFirstOne").click(() => {
    kickFirstOne();
});

// kick(in the ASS), cause I hate those mfers
function kickFirstOne(){
    popFirstOne(id).then((data) => {
        console.log(data);
    });
}