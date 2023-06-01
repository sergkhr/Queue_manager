export var AccessType;
(function (AccessType) {
    AccessType["PUBLIC"] = "PUBLIC";
    AccessType["PRIVATE"] = "PRIVATE";
    AccessType["VK_PRIVATE"] = "VK_PRIVATE";
})(AccessType || (AccessType = {}));
export var PeopleType;
(function (PeopleType) {
    PeopleType["SITE"] = "SITE";
    PeopleType["NOT_LOGGED"] = "NOT_LOGGED";
    PeopleType["VK"] = "VK";
})(PeopleType || (PeopleType = {}));
export class Queue {
    constructor(queue) {
        var _a, _b, _c;
        this.name = queue.name;
        this.description = queue.description || "Default description";
        this.config = {
            owner: ((_a = queue.config) === null || _a === void 0 ? void 0 : _a.owner) || "",
            accessType: ((_b = queue.config) === null || _b === void 0 ? void 0 : _b.accessType) || AccessType.PUBLIC,
            length: ((_c = queue.config) === null || _c === void 0 ? void 0 : _c.length) || Infinity,
        };
        this.queuedPeople = queue.queuedPeople || [];
        this.vkConfs = queue.vkConfs || [];
    }
    getPeopleList() {
        return Array.from(this.queuedPeople);
    }
    addPeople(login, loginType, type) {
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
    linkVkConf(id) {
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
