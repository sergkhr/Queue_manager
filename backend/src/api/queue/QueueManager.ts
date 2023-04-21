import {Queue, Config, IQueue} from "./Queue.js";
import {UserManager} from "../user/UserManager.js";
import fs from "fs"
import Db from "mongodb"

export interface Filter {
    owner?: number;
    accessType?: string;
    length?: number;
    vkConf?: number;
}

export class QueueManager {
    db: Db.Db;
    queues: Queue[] = [];

    constructor(db: Db.Db) {
        this.db = db;
        this.db.collection("Queues").find({}).toArray().catch(err => {
            console.log("Something went wrong during \"Queues\" find");
            console.log(err);
        }).then(items => {
            console.log("Queues loaded: " + this.queues.length);
        })
    }

    async getQueues (filter: Filter = {}, full: boolean = false) {
        let res: {}[] = [];
        return await this.db.collection("Queues").find(filter).toArray().catch(err => {
            console.log("")
            console.log(err);
        }).then(queues => {
            if (!queues) {
                return []
            }
            if (full) {
                return queues;
            } else {
                return queues.map(item => {
                    return {
                        name: item.name,
                        description: item.description,
                        length: item.config.length,
                        count: item.queuedPeople.length
                    }
                });
            }
        })

        // for (let i in this.queues) {
        //     if (!filter.vkConf || this.queues[i].vkConfs.includes(filter.vkConf)) {
        //         if (full) {
        //             res.push(this.queues[i]);
        //         } else {
        //             res.push({
        //                 name: this.queues[i].name,
        //                 description: this.queues[i].description
        //             });
        //         }
                
        //     }
        // }
        // return res;
    }







    // load() {
    //     let rawQueues = JSON.parse(fs.readFileSync("data/queues.json", "utf8"));
    //     for (let i in rawQueues) {
    //         this.queues.push(new Queue(rawQueues[i]));
    //     }
    //     console.log("Queues loaded: " + this.queues.length);
    // }
    // save() {
    //     fs.writeFileSync("data/queues.json", JSON.stringify(this.queues, null, 4));
    //     console.log("Queues saved: " + this.queues.length);
    // }
    createQueue (queue: Queue) {
        if (!queue.name) {
            return false;
        } 
        let newQueue = new Queue(queue)
        this.queues.push(newQueue);
        return newQueue;
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