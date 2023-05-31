export class Result {
    constructor(success, description = "") {
        this.success = success;
        if (description != "") {
            this.message = description;
        }
        else if (!success) {
            this.message = "Unknown error";
        }
        else {
            this.message = "";
        }
    }
}
