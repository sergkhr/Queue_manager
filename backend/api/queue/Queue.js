export default class Queue {
    /*
    config {
        owner: int,
        accessType: ="public" || "private",
        length: int =Infinity,
    }
    */
    constructor(queue) {
        this.name = queue.name;
        this.description = queue.description || "Default description"
        this.config = {
            owner: queue.config?.owner || 0,
            accessType: queue.config?.accessType || "public",
            length: queue.config?.length || Infinity,
        }
        this.queuedPeople = [];
    }
    getPeopleList() {
        return Array.from(this.queuedPeople);
    }
    addPeople(peopleId) {
        if (!this.config.length || this.queuedPeople.length < this.config.length) {
            this.queuedPeople.push(peopleId);
        }
    }
}