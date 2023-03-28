
class Human:
    def __init__(self, name="", user_id=0):
        self.name = name
        self.user_id = user_id
        self.freeze = False

    def get_name(self):
        return self.name

    def is_freezed(self):
        return self.freeze

    def get_user_id(self):
        return self.user_id

    def set_freeze(self, to_freeze):
        self.freeze = to_freeze


class Queue:
    def __init__(self):
        self.name = ""
        self.queued_humans = []
        self.description = ""

    def show(self) -> str:
        if len(self.queued_humans) == 0:
            return "-"
        result = ""
        for i, who in enumerate(self.queued_humans):
            result += f"{i + 1}) "
            if self.queued_humans[i].is_freezed():
                result += "❄"
            result += who + "\n"
        return result

    def add(self, full_name, from_id=0) -> bool:
        human = Human(full_name, from_id)
        for i in self.queued_humans:
            if full_name == i.get_name():
                return False
        self.queued_humans.append(human)
        return True


    def set_name(self, name):
        self.name = name

    def set_description(self, descr):
        self.description = descr

    def info(self) -> str:
        if self.name != "":
            if self.description != "":
                descr = f"Описание: {self.description}"
            else:
                descr = ""
            return f"Название: {self.name}\n {descr}"
        else:
            return ""

    def clear(self):
        self.queued_humans.clear()
        self.name = ""
        self.description = ""

    def pop(self) -> str:
        for i in range(len(self.queued_humans)):
            if not self.queued_humans[i].is_freezed():
                return self.queued_humans.pop(i).get_name()
        return "-"

    def quit(self, man) -> bool:
        for num, i in enumerate(self.queued_humans):
            if i.get_name() == man:
                self.queued_humans.pop(num)
                return True
        return False

    def get_name(self) -> str:
        return self.name

    def get_first(self) -> str:
        if len(self.queued_humans) != 0:
            for i in range(len(self.queued_humans)):
                if not self.queued_humans[i].is_freezed():
                    return self.queued_humans[i]
            return ""
        else:
            return ""

    def swap(self, man) -> str:
        if len(self.queued_humans) < 1:
            return "1"
        for num, i in enumerate(self.queued_humans):
            if i.get_name() == man:
                if num + 1 > len(self.queued_humans) - 1:
                    return "max"
                if self.queued_humans[num].is_freezed():
                    return "*"
                while num < len(self.queued_humans) - 1:
                    if self.queued_humans[num].is_freezed():
                        num += 1
                    else:
                        buf = self.queued_humans[num]
                        self.queued_humans[num] = self.queued_humans[num + 1]
                        self.queued_humans[num + 1] = buf
                        return self.queued_humans[num]
                return "max"
        return "none"

    def freeze(self, man) -> str:
        for num, i in enumerate(self.queued_humans):
            if i == man:
                if self.queued_humans[num].is_freezed():
                    return "+-"
                self.queued_humans[num].set_freeze(True)
                return "+"
        return "-"

    def unfreeze(self, man) -> str:
        for num, i in enumerate(self.queued_humans):
            if i == man:
                if not self.queued_humans[num].is_freezed():
                    return "+-"
                self.queued_humans[num].set_freeze(False)
                return "+"
        return "-"