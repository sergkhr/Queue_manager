export enum AccessType {
    PUBLIC = "PUBLIC",
    PRIVATE = "PRIVATE",
    VK_PRIVATE = "VK_PRIVATE"
}

export type Config = {
    owner?: string,
    accessType?: AccessType,
    length?: number
}

export interface IQueue {
    name: string;
    description?: string;
    config: Config;
    queuedPeople: UserState[];
    vkConfs?: number[];
}

export interface UserState {
    login: string;
    frozen?: boolean;
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

    addPeople(login: string, loginType: string) {
        if (!this.config.length || this.queuedPeople.length < this.config.length) {
            this.queuedPeople.push({
                login: login
            });
            return true;
        }
        return false;
    }

    linkVkConf(id: number) {
        this.vkConfs.push(id);
    }
}

// export interface IQueue {
//     name: string;
//     description?: string;
//     config: Config;
//     queuedPeople: UserState[];
//     vkConfs?: number[];
// }