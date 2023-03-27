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
        let newQueue = new Queue(queue)
        this.queues.push(newQueue);
        return newQueue;
    }
    getQueueList (filter: any = {}, full: boolean = false) {
        let res: {}[] = [];
        for (let i in this.queues) {
            if (!filter.vkConf || this.queues[i].vkConfs.includes(filter.vkConf)) {
                if (full) {
                    res.push(this.queues[i]);
                } else {
                    res.push({
                        name: this.queues[i].name,
                        description: this.queues[i].description
                    });
                }
                
            }
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