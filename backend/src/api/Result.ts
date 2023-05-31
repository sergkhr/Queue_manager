export class Result {
    success: boolean;
    message: any;

    constructor(success: boolean, description = "") {
        this.success = success;
        if (description != "") {
            this.message = description;
        } else if (!success) {
            this.message = "Unknown error";
        } else {
            this.message = ""
        }
    }
}