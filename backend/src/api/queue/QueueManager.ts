import {Queue, Config, IQueue} from "./Queue.js";
import Db, { ObjectId } from "mongodb"
import { Result } from "../Result.js";

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
                // return queues.map(item => {
                //     return {
                //         name: item.name,
                //         description: item.description,
                //         length: item.config.length,
                //         count: item.queuedPeople.length
                //     }
                // });
                return queues;
            }
        })
    }

    async createQueue (queue: IQueue) {
        let q = new Queue(queue);
        console.log(JSON.stringify(q));
        return await this.db.collection("Queues").insertOne(q).catch(err => {
            console.log("Something went wrong during \"Queues\" insertOne");
            console.log(err);
            return new Result(false);
        }).then(item => {
            return new Result(true);
        });
    }

    async getQueue(id: string) {
        return await this.db.collection("Queues").findOne({_id: new ObjectId(id)}).catch(err => {
            console.log("Something went wrong during \"Queues\" findOne");
            console.log(err);
            return null;
        }).then(queue => {
            if (!queue) {
                return null;
            } else {
                return queue as unknown as IQueue;
            }
        })
    }

    async deleleQueue(id: string) {
        console.log("Entered queue delete")
        return await this.db.collection("Queues").deleteOne({_id: new ObjectId(id)}).catch(err => {
            console.log("Something went wrong during \"Queues\" deleteOne");
            console.log(err);
            return null;
        }).then(result => {
            return result;
        })
    }

    async joinQueue(id: string, login: string) {
        if (await this.isUserInQueue(id, login)) {
            return new Result(false, "You are already in queue");
        }
        return await this.db.collection("Queues").updateOne({_id: new ObjectId(id)}, {$push: {queuedPeople: login}}).catch(err => {
            console.log("Something went wrong during \"Queues\" updateOne");
            console.log(err);
            return null;
        }).then(result => {
            return result;
        })
    }

    async leaveQueue(id: string, login: string) {
        if (!await this.isUserInQueue(id, login)) {
            return new Result(false, "You are not in queue");
        }
        return await this.db.collection("Queues").updateOne({_id: new ObjectId(id)}, {$pull: {queuedPeople: login}}).catch(err => {
            console.log("Something went wrong during \"Queues\" updateOne");
            console.log(err);
            return null;
        }).then(result => {
            return result;
        })
    }

    async isUserInQueue(id: string, login: string) {
        return await this.db.collection("Queues").findOne({_id: new ObjectId(id), queuedPeople: login}).catch(err => {
            console.log("Something went wrong during \"Queues\" findOne");
            console.log(err);
            return null;
        }).then(queue => {
            if (!queue) {
                return false;
            } else {
                return true;
            }
        })
    }
}