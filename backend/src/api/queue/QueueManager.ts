import Queue from "./Queue.js";
import UserManager from "../user/UserManager.js";
import fs from "fs"

export default class QueueManager {
    queues: Queue[] = [];

    constructor() {
        this.load();
    }
    load() {
        let rawQueues = JSON.parse(fs.readFileSync("data/queues.json", "utf8"));
        for (let i in rawQueues) {
            this.queues.push(new Queue(rawQueues[i]));
        }
        console.log("Queues loaded: " + this.queues.length);
    }
    save() {
        fs.writeFileSync("data/queues.json", JSON.stringify(this.queues, null, 4));
        console.log("Queues saved: " + this.queues.length);
    }
    createQueue (queue: Queue) {
        if (!queue.name) {
            return false;
        } 
        this.queues.push(new Queue(queue));
        return true;
    }
    getQueueList () {
        let res: {}[] = [];
        for (let i in this.queues) {
            res.push({
                name: this.queues[i].name,
                description: this.queues[i].description
            });
        }
        return res;
    }
    getQueue (name: string) {
        for (let i in this.queues) {
            if (this.queues[i].name == name) {
                return this.queues[i];
            }
        }
        return null;
    }
    
}