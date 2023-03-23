export default class Result {
    success: boolean;
    description: string;

    constructor(success: boolean, description = "Something went wrong") {
        this.success = success;
        this.description = description;
    }
}