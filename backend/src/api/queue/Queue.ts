import { ObjectId } from "mongodb";

export enum AccessType {
    PUBLIC = "PUBLIC",
    PRIVATE = "PRIVATE",
    VK_PRIVATE = "VK_PRIVATE"
}

export type Config = {
    owner: {
        login: string,
        type: PeopleType
    },
    accessType?: AccessType,
    length?: number
}

export interface IQueue {
    _id?: ObjectId;
    name: string;
    description?: string;
    config: Config;
    queuedPeople: UserState[];
    vkConfs?: number[];
}

export enum PeopleType {
    SITE = "SITE",
    NOT_LOGGED = "NOT_LOGGED",
    VK = "VK"
}

export interface UserState {
    type: PeopleType;
    login: string;
    frozen: boolean;
}

export class Queue implements IQueue{
    name: string;
    description: string;
    config: Config;
    queuedPeople: UserState[];
    vkConfs: number[];

    constructor(queue: IQueue){
        this.name = queue.name;
        this.description = queue.description || "Default description"
        this.config = {
            owner: queue.config?.owner || "",
            accessType: queue.config?.accessType as AccessType || AccessType.PUBLIC,
            length: queue.config?.length || Infinity,
        }
        this.queuedPeople = queue.queuedPeople || [];
        this.vkConfs = queue.vkConfs || [];
    }

    getPeopleList() {
        return Array.from(this.queuedPeople);
    }

    addPeople(login: string, loginType: string, type: PeopleType) {
        if (!this.config.length || this.queuedPeople.length < this.config.length) {
            this.queuedPeople.push({
                type: type,
                login: login,
                frozen: false
            });
            return true;
        }
        return false;
    }

    linkVkConf(id: number) {
        this.vkConfs.push(id);
    }
}