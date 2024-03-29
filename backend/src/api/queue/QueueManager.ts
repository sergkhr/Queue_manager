import { Queue, Config, IQueue, AccessType, UserState, PeopleType } from "./Queue.js";
import Db, { ObjectId } from "mongodb"
import { Result } from "../Result.js";
import Express from "express";
import { UserManager } from "../user/UserManager.js";

export interface Filter {
    owner?: number;
    accessType?: string;
    length?: number;
    vkConf?: number;
}

interface Subscribe {
    id: number;
    queueId: ObjectId;
    res: Express.Response;
};

export class QueueManager {
    db: Db.Db;
    queues: Queue[] = [];
    subscribers: Subscribe[] =[];
    userManager: UserManager;

    constructor(db: Db.Db, userManager: UserManager){
        this.db = db;
        this.userManager = userManager;
        this.db.collection("Queues").find({}).toArray().catch(err => {
            console.log("Something went wrong during \"Queues\" find");
            console.log(err);
        }).then(items => {
            console.log("Queues loaded: " + (items ? items.length : 0));
        })

        this.db.collection("Queues").watch().on('change', change => {
            console.log("Queues was changed");
            this.onQueuesChanged(change);
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
                //         _id: item._id,
                //         name: item.name,
                //         description: item.description,
                //         config: item.config,
                //         peopleCount: item.queuedPeople.length
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
            let oid = (item as unknown as Db.InsertOneResult<Db.BSON.Document>)
            console.log(oid.insertedId.toString());
            return new Result(true, oid.insertedId.toString());
        });
    }

    async hasRights(id: ObjectId, login: string) {
        let queue = await this.getQueue(id);
        if (!queue) {
            return false;
        }
        if (queue.config.owner.login == login || queue.config.accessType == AccessType.PUBLIC) {
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

    async joinQueue(id: ObjectId, login: string, type: PeopleType) {
        if (await this.isUserInQueue(id, login)) {
            return new Result(false, "You are already in queue");
        }
        return await this.db.collection("Queues").updateOne({_id: id}, {$push: {
            queuedPeople: {
                login: login,
                frozen: false,
                type: type
            }
        }}).catch(err => {
            console.log("Something went wrong during \"Queues\" updateOne");
            console.log(err);
            return new Result(false, "Something went wrong during \"Queues\" updateOne");
        }).then(result => {
            return new Result(true);
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

    async isUserInQueue(queueId: ObjectId, login: string) {
        return await this.db.collection("Queues").findOne({_id: queueId, queuedPeople: {$elemMatch: {login: login}}}).catch(err => {
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
        let queue = await this.db.collection("Queues").findOne({_id: id, queuedPeople: {$elemMatch: {login: login}}}) as unknown as IQueue;

        let newUser: UserState = {
            login: login,
            frozen: false,
            type: PeopleType.NOT_LOGGED
        };

        for (let i in queue.queuedPeople) {
            if (queue.queuedPeople[i].login == login) {
                if (!queue.queuedPeople[i].frozen) {
                    newUser.frozen = true;
                }
                newUser.type = queue.queuedPeople[i].type;
            }
        }
        return await this.db.collection("Queues").updateOne({_id: new ObjectId(id), queuedPeople: {$elemMatch: {login: login}}}, 
                        {$set: {"queuedPeople.$": newUser}}).catch(err => {
            console.log("Something went wrong during \"Queues\" updateOne");
            console.log(err);
            return null;
        }).then(result => {
            return result;
        })
    }

    async popQueue (id: ObjectId) {
        let queue = await this.getQueue(id);
        if (!queue) {
            return new Result(false, "Queue not found");
        }
        let people = queue.queuedPeople;
        let state = people.find(item => {
            return !item.frozen;
        })
        if (!state) {
            return new Result(false, "There are no not frozen people in queue");
        }
        return await this.db.collection("Queues").updateOne({_id: id}, {$pull: {queuedPeople: {login: state.login}}}).catch(err => {
            console.log(err);
            return new Result(false, err);
        }).then(item => {
            return item;
        })
    }

    async onQueuesChanged(change: any) {
        if (change.operationType == "update") {
            this.notifyUserInQueue(change.documentKey._id);
        }
        for (let sub of this.subscribers) {
            if (change.documentKey._id.toString() == sub.queueId.toString()) {
                console.log(`Sending event ${change.operationType}`);
                if (change.operationType == "update") {
                    sub.res.write("data: " + JSON.stringify({
                        op: "update",
                        update: change.updateDescription.updatedFields
                    }) + "\n\n")
                } else if (change.operationType == "delete") {
                    sub.res.write("data: " + JSON.stringify({
                        op: "delete"
                    }) + "\n\n")
                }
            }
        }
    }

    async notifyUserInQueue(id: ObjectId) {
        console.log("asd")
        this.getQueue(id).then(item => {
            console.log(item);
            if (!item) {
                return;
            }
            let user = item.queuedPeople.find(u => {
                return !u.frozen;
            })
            console.log(user)
            if (!user) {
                return;
            }
            this.userManager.notifyUser(user.login, item);
        })
    }

    async subscribe(queueId: ObjectId, req: Express.Request, res: Express.Response){
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
            })
            req.on('close', () => {
                console.log("Connection closed");
                let i = this.subscribers.length;
                this.subscribers = this.subscribers.filter(sub => sub.id !== subID)
                console.log(`Deleted ${this.subscribers.length - i} subscribes`);
            });
        })
    }
}