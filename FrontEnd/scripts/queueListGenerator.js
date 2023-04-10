function generateQueueListElement(){
    let container = $("#listContainer");

    let addingElement = $("\
        <div class=\"queueBlock\">\
            <div class=\"textWrapper\">\
                <h1>Queue name</h1>\
                <b>Участников: <span class=\"memberCount\">23</span></b>\
                <p class=\"queueDesciption\">Lorem Ipsum jhghgh gdgdg jhkjh gdsggd jjhg j hgdgfd idusajhf iudssahhd sjashgd</p>\
            </div>\
            <button class=\"queueSettingsBtn\">Редактировать</button>\
        </div>");

    container.append(addingElement);
}

for(let i = 0; i < 3; i++){
    generateQueueListElement();
}