enum AccessType {
    PUBLIC = "public",
    PRIVATE = "private"
}

export type Config = {
    owner?: string,
    accessType?: AccessType,
    length?: number
}

export interface IQueue {
    name: string;
    description?: string;
    config?: Config;
    queuedPeople?: {}[];
    vkConfs?: number[];
}

export class Queue implements IQueue{
    name: string;
    description: string;
    config: Config;
    queuedPeople: {}[];
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
                login: login,
                loginType: loginType
            });
            return true;
        }
        return false;
    }

    linkVkConf(id: number) {
        this.vkConfs.push(id);
    }
}