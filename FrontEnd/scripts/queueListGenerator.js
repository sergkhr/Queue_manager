function generateQueueListElement(queue){
    let container = $("#listContainer");

    let addingElement = $("\
        <div class=\"queueBlock\">\
            <div class=\"textWrapper\">\
                <h1>"+ queue.name +"</h1>\
                <b>Участников: <span class=\"memberCount\">"+ queue.queuedPeople.length +"</span></b>\
                <p class=\"queueDesciption\">"+ queue.description +"</p>\
            </div>\
            <a href=\"queueSettings.html?id=" + queue._id + "\"  class=\"queueSettingsBtn myBtn\">\
                <div>Подробнее</div>\
            </a>\
        </div>");

    container.append(addingElement);
}


queueList = getQueueList(); // queueList is a promise
queueList.then((data) => {
   data.forEach((queue) => {
       generateQueueListElement(queue);
   });
});