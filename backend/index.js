import Application from "./app.js";
import config from "./config.json" assert {type: 'json' };;

let app = new Application();
app.expressApp.listen(config.port, config.host, function() {
    console.log(`App listening at port ${config.port}`);
});