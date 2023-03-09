export default class Result {
    constructor(success, description) {
        this.success = success;
        if (description) {
            this.description = description;
        } else if (!success) {
            this.description = "Something went wrong";
        }
    }
}