type Config = {
    owner: number,
    accessType: string,
    length: number
}

export class Queue {
    name: string;
    description: string;
    config: Config;
    queuedPeople: {}[];
    vkConfs: number[];

    constructor(queue: Queue, vkConfs: number[] = []) {
        this.name = queue.name;
        this.description = queue.description || "Default description"
        this.config = {
            owner: queue.config?.owner || 0,
            accessType: queue.config?.accessType || "public",
            length: queue.config?.length || Infinity,
        }
        this.queuedPeople = [];
        this.vkConfs = vkConfs;
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