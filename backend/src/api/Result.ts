export default class Result {
    success: boolean;
    description: any;

    constructor(success: boolean, description = "") {
        this.success = success;
        if (description != "") {
            this.description = description;
        } else if (!success) {
            this.description = "Unknown error";
        }
    }
}