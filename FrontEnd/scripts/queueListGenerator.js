function generateQueueListElement(id){
    let container = $("#listContainer");

    let addingElement = $("\
        <div class=\"queueBlock\">\
            <div class=\"textWrapper\">\
                <h1>Queue name</h1>\
                <b>Участников: <span class=\"memberCount\">23</span></b>\
                <p class=\"queueDesciption\">Lorem Ipsum jhghgh gdgdg jhkjh gdsggd jjhg j hgdgfd idusajhf iudssahhd sjashgd</p>\
            </div>\
            <a href=\"queueSettings.html?id=" + id + "\"  class=\"queueSettingsBtn\">\
                <div>Подробнее</div>\
            </a>\
        </div>");

    container.append(addingElement);
}

for(let i = 2; i <= 4; i++){
    generateQueueListElement(i);
}