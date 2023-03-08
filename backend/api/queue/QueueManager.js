import Queue from "./Queue.js";
import UserManager from "../user/UserManager.js";
import fs from "fs"

export default class QueueManager {
    constructor() {
        this.queues = [];
        this.load();
    }
    load() {
        let rawQueues = JSON.parse(fs.readFileSync("data/queues.json", "utf8"));
        for (let i in rawQueues) {
            this.queues.push(new Queue(rawQueues[i]));
        }
    }
    save() {
        fs.writeFileSync("data/queues.json", JSON.stringify(this.queues, null, 4));
    }
    createQueue (queue) {
        if (!queue.name) {
            return false;
        } 
        this.queues.push(new Queue(queue));
        return true;
    }
    getQueueList () {
        return this.queues;
    }
}