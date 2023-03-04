import Application from "./api/app.js";
import config from "./api/config.json" assert {type: 'json' };;

let app = new Application();
app.expressApp.listen(config.port, config.host, function() {
    console.log(`App listening at port ${config.port}`);
});