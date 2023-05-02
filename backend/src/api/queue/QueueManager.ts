import {Queue, Config, IQueue, AccessType} from "./Queue.js";
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

    constructor(db: Db.Db){
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

    async createQueue(queue: IQueue) {
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

    async hasRights(id: ObjectId, login: string) {
        let queue = await this.getQueue(id);
        if (!queue) {
            return false;
        }
        if (queue.config.owner == login || queue.config.accessType == AccessType.PUBLIC) {
            return true;
        }
        return false;
    }

    async getQueue(id: ObjectId) {
        return await this.db.collection("Queues").findOne({_id: id}).catch(err => {
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

    async deleleQueue(id: ObjectId) {
        console.log("Entered queue delete")
        return await this.db.collection("Queues").deleteOne({_id: id}).catch(err => {
            console.log("Something went wrong during \"Queues\" deleteOne");
            console.log(err);
            return null;
        }).then(result => {
            return result;
        })
    }

    async joinQueue(id: ObjectId, login: string) {
        if (await this.isUserInQueue(id, login)) {
            return new Result(false, "You are already in queue");
        }
        return await this.db.collection("Queues").updateOne({_id: id}, {$push: {queuedPeople: {login: login}}}).catch(err => {
            console.log("Something went wrong during \"Queues\" updateOne");
            console.log(err);
            return null;
        }).then(result => {
            return result;
        })
    }

    async leaveQueue(id: ObjectId, login: string) {
        if (!await this.isUserInQueue(id, login)) {
            return new Result(false, "You are not in queue");
        }
        return await this.db.collection("Queues").updateOne({_id: id}, {$pull: {queuedPeople: {login: login}}}).catch(err => {
            console.log("Something went wrong during \"Queues\" updateOne");
            console.log(err);
            return null;
        }).then(result => {
            return result;
        })
    }

    async isUserInQueue(id: ObjectId, login: string) {
        return await this.db.collection("Queues").findOne({_id: id, queuedPeople: {login: login}}).catch(err => {
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

    async freezeUser(id: ObjectId, login: string) {
        if (!await this.isUserInQueue(id, login)) {
            return new Result(false, "You are not in queue");
        }
        this.db.collection("Queues").updateOne({_id: new ObjectId(id), queuedPeople: {login: login}}, 
                    {$set: {"queuedPeople.$": {login: login, frozen: true}}}).catch(err => {
            console.log("Something went wrong during \"Queues\" updateOne");
            console.log(err);
            return null;
        }).then(result => {
            return result;
        })
    }
}