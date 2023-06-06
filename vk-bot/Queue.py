import json
import time
from UserManager import UserManager


class Owner:
    def __init__(self, type, login):
        self.type = type
        self.login = login

    @classmethod
    def from_json(cls, json_data):
        data = json.loads(json_data)
        return cls(**data)


class Queue:
    def __init__(self, peer_id, owner, id=0, name="", description="", accessType="PRIVATE", queuedPeople=[], delay=0):
        if id != 0:
            self._id = id
        self.name = name
        self.description = description
        self.config = {
            "owner": {
                "login": owner["login"],
                "type": owner["type"]
            },
            "accessType": accessType
        }
        self.queuedPeople = queuedPeople
        self.vkConfs = [peer_id]
        if delay != 0:
            self.config["start"] = time.time() + delay*60

    @classmethod
    def from_map(cls, map):
        return cls(map["vkConfs"], map["config"]["owner"], map["_id"],  map["name"], map["description"],  map["config"]["accessType"], map["queuedPeople"])

    def to_json(self):
        return self.__dict__

    def __str__(self):
        return json.dumps(self.__dict__)

    def set_name(self, name):
        self.name = name

    def set_description(self, description):
        self.description = description

    def is_user_in_queue(self, user) -> bool:
        for i in self.queuedPeople:
            if user["login"] == i["login"]:
                return True
        return False

    def show(self) -> str:
        if len(self.queuedPeople) == 0:
            return "-"
        result = ""
        for i, who in enumerate(self.queuedPeople):
            result += f"{i + 1}) "
            if self.queuedPeople[i]["frozen"]:
                result += "❄"
            if who["type"] == "NOT_LOGGED" or who["type"] == "SITE":
                result += who["login"] + "\n"
            else:
                result += who["username"] + "\n"
        return result

    def info(self) -> str:
        if self.name != "":
            if self.description != "":
                descr = f"Описание: {self.description}"
            else:
                descr = ""
            return f"Название: {self.name}\n {descr}"
        else:
            return ""

    def get_first(self) -> str:
        if self.queuedPeople[0]["type"] == "VK":
            return self.queuedPeople[0]["username"]
        else:
            return self.queuedPeople[0]["login"]

    def get_next(self, login) -> str:
        if len(self.queuedPeople) > 1:
            for num, human in enumerate(self.queuedPeople):
                if human["login"] == login:
                    if len(self.queuedPeople) > num+1:
                        for i in range(num,len(self.queuedPeople)):
                            hum = self.queuedPeople[num+1]
                            if hum["frozen"]:
                                continue
                            if hum["type"] == "VK":
                                return f"[id{hum['login']}|{hum['username']}]"
                            else:
                                return hum["login"]
                    else:
                        return ""
        else:
            return ""

    def pop(self):
        for human in self.queuedPeople:
            if not human["frozen"]:
                if human["type"] == "VK":
                    return human["login"], human["username"]
                return human["login"], human["login"]
        return "-"

    def find_person(self, login):
        for human in self.queuedPeople:
            if human["login"] == login:
                return human["frozen"]
        return "-"
