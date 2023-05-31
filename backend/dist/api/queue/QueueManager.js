import { Queue, AccessType } from "./Queue.js";
import { ObjectId } from "mongodb";
import { Result } from "../Result.js";
;
export class QueueManager {
    constructor(db) {
        this.queues = [];
        this.subscribers = [];
        this.db = db;
        this.db.collection("Queues").find({}).toArray().catch(err => {
            console.log("Something went wrong during \"Queues\" find");
            console.log(err);
        }).then(items => {
            console.log("Queues loaded: " + (items ? items.length : 0));
        });
        this.db.collection("Queues").watch().on('change', change => {
            console.log("Queues was changed");
            this.onQueuesChanged(change);
        });
    }
    async getQueues(filter = {}, full = false) {
        return await this.db.collection("Queues").find(filter).toArray().catch(err => {
            console.log("");
            console.log(err);
        }).then(queues => {
            if (!queues) {
                return [];
            }
            if (full) {
                return queues;
            }
            else {
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
        });
    }
    async createQueue(queue) {
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
    async hasRights(id, login) {
        let queue = await this.getQueue(id);
        if (!queue) {
            return false;
        }
        if (queue.config.owner == login || queue.config.accessType == AccessType.PUBLIC) {
            return true;
        }
        return false;
    }
    async getQueue(id) {
        return await this.db.collection("Queues").findOne({ _id: id }).catch(err => {
            console.log("Something went wrong during \"Queues\" findOne");
            console.log(err);
            return null;
        }).then(queue => {
            if (!queue) {
                return null;
            }
            else {
                return queue;
            }
        });
    }
    async deleleQueue(id) {
        console.log("Entered queue delete");
        return await this.db.collection("Queues").deleteOne({ _id: id }).catch(err => {
            console.log("Something went wrong during \"Queues\" deleteOne");
            console.log(err);
            return null;
        }).then(result => {
            return result;
        });
    }
    async joinQueue(id, login) {
        if (await this.isUserInQueue(id, login)) {
            return new Result(false, "You are already in queue");
        }
        return await this.db.collection("Queues").updateOne({ _id: id }, { $push: { queuedPeople: { login: login } } }).catch(err => {
            console.log("Something went wrong during \"Queues\" updateOne");
            console.log(err);
            return new Result(false, "Something went wrong during \"Queues\" updateOne");
        }).then(result => {
            return new Result(true);
        });
    }
    async leaveQueue(id, login) {
        if (!await this.isUserInQueue(id, login)) {
            return new Result(false, "You are not in queue");
        }
        return await this.db.collection("Queues").updateOne({ _id: id }, { $pull: { queuedPeople: { login: login } } }).catch(err => {
            console.log("Something went wrong during \"Queues\" updateOne");
            console.log(err);
            return null;
        }).then(result => {
            return result;
        });
    }
    async isUserInQueue(queueId, login) {
        return await this.db.collection("Queues").findOne({ _id: queueId, queuedPeople: { $elemMatch: { login: login } } }).catch(err => {
            console.log("Something went wrong during \"Queues\" findOne");
            console.log(err);
            return null;
        }).then(queue => {
            if (!queue) {
                return false;
            }
            else {
                return true;
            }
        });
    }
    async freezeUser(id, login) {
        if (!await this.isUserInQueue(id, login)) {
            return new Result(false, "You are not in queue");
        }
        let queue = await this.db.collection("Queues").findOne({ _id: id, queuedPeople: { $elemMatch: { login: login } } });
        let newUser = {
            login: login
        };
        for (let i in queue.queuedPeople) {
            if (queue.queuedPeople[i].login == login) {
                if (!queue.queuedPeople[i].frozen) {
                    newUser.frozen = true;
                }
            }
        }
        return await this.db.collection("Queues").updateOne({ _id: new ObjectId(id), queuedPeople: { $elemMatch: { login: login } } }, { $set: { "queuedPeople.$": newUser } }).catch(err => {
            console.log("Something went wrong during \"Queues\" updateOne");
            console.log(err);
            return null;
        }).then(result => {
            return result;
        });
    }
    async popQueue(id) {
        let queue = await this.getQueue(id);
        if (!queue) {
            return new Result(false, "Queue not found");
        }
        let people = queue.queuedPeople;
        let i = people.findIndex(item => {
            return !item.frozen;
        });
        if (i >= 0) {
            people.splice(i, 1);
        }
        return await this.db.collection("Queues").updateOne({ _id: id }, { $set: { queuedPeople: people } }).catch(err => {
            console.log(err);
            return new Result(false, err);
        }).then(item => {
            return item;
        });
    }
    async onQueuesChanged(change) {
        for (let sub of this.subscribers) {
            if (change.documentKey._id.toString() == sub.queueId.toString()) {
                console.log(`Sending event ${change.operationType}`);
                if (change.operationType == "update") {
                    sub.res.write("data: " + JSON.stringify({
                        op: "update",
                        update: change.updateDescription.updatedFields
                    }) + "\n\n");
                }
                else if (change.operationType == "delete") {
                    sub.res.write("data: " + JSON.stringify({
                        op: "delete"
                    }) + "\n\n");
                }
            }
        }
    }
    async subscribe(queueId, req, res) {
        return await this.getQueue(queueId).catch(err => {
            console.log("Something went wrong during subscribe");
            return new Result(false);
        }).then(item => {
            if (item == null) {
                return new Result(false);
            }
            let subID = Date.now();
            this.subscribers.push({
                id: subID,
                queueId: queueId,
                res: res
            });
            req.on('close', () => {
                console.log("Connection closed");
                let i = this.subscribers.length;
                this.subscribers = this.subscribers.filter(sub => sub.id !== subID);
                console.log(`Deleted ${this.subscribers.length - i} subscribes`);
            });
        });
    }
}
