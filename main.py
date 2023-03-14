import os
import vk_api
from vk_api.keyboard import VkKeyboard, VkKeyboardColor
from vk_api.longpoll import VkLongPoll, VkEventType
from private_api import *
from vk_api.bot_longpoll import VkBotLongPoll, VkBotEventType
from vk_api.utils import get_random_id
import copy
import pickle


class Queue:
    def __init__(self):
        self.name = ""
        self.queued_humans = []
        self.humans_freeze = []
        self.description = ""

    def show(self) -> str:
        if len(self.queued_humans) == 0:
            return "-"
        result = ""
        for i, who in enumerate(self.queued_humans):
            result += f"{i + 1})"
            if self.humans_freeze[i]:
                result += " ❄"
            result += who + "\n"
        return result

    def add(self, full_name) -> bool:
        if full_name not in self.queued_humans:
            self.queued_humans.append(full_name)
            self.humans_freeze.append(False)
            return True
        else:
            return False

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
        self.humans_freeze.clear()
        self.name = ""
        self.description = ""

    def pop(self) -> str:
        for i in range(len(self.queued_humans)):
            if not self.humans_freeze[i]:
                return self.queued_humans.pop(0)
        return "-"

    def quit(self, man) -> bool:
        for num, i in enumerate(self.queued_humans):
            if i == man:
                self.queued_humans.pop(num)
                self.humans_freeze.pop(num)
                return True
        return False

    def get_name(self):
        return self.name

    def swap(self, man) -> str:
        if len(self.queued_humans) < 1:
            return "1"
        for num, i in enumerate(self.queued_humans):
            if i == man:
                if num + 1 > len(self.queued_humans) - 1:
                    return "max"
                if self.humans_freeze[num]:
                    return "*"
                while num < len(self.queued_humans) -1:
                    if self.humans_freeze[num]:
                        num += 1
                    else:
                        buf = self.queued_humans[num]
                        self.queued_humans[num] = self.queued_humans[num+1]
                        self.queued_humans[num+1] = buf
                        return self.queued_humans[num]
                return "max"
        return "none"

    def freeze(self,man) -> str:
        for num, i in enumerate(self.queued_humans):
            if i == man:
                if self.humans_freeze[num]:
                    return "+-"
                self.humans_freeze[num] = True
                return "+"
        return "-"

    def unfreeze(self,man) -> str:
        for num, i in enumerate(self.queued_humans):
            if i == man:
                if not self.humans_freeze[num]:
                    return "+-"
                self.humans_freeze[num] = False
                return "+"
        return "-"


def send_message(id, msg, stiker=None, attach=None):
    try:
        vk.messages.send(random_id=get_random_id(),
                         peer_id=id,
                         message=msg)
    except BaseException as ex:
        print(ex)
        return

buf = {}
commands = "#имя #описание #фиксирую #поп #выхожу #очередь #фиксация #анфикс #пропустить #заморозка #разморозка"
commands = commands.split()
if __name__ == "__main__":
    vk_session = vk_api.VkApi(token=token_api)
    longpoll = VkBotLongPoll(vk_session, 219286730)
    vk = vk_session.get_api()
    print("Bot started")
    conversations = vk.messages.getConversations()
    state = {}
    if not os.path.isfile(f'{os.path.dirname(os.getcwd())}\\queue_file\\queue.pkl'):
        queue = {}
    else:
        with open(f'{os.path.dirname(os.getcwd())}\\queue_file\\queue.pkl', 'rb') as f:
            queue = pickle.load(f)
            print("Queue loaded")
    count = 0
    have_queue = False
    for event in longpoll.listen():
        if event.type == VkBotEventType.MESSAGE_NEW and event.from_chat:

            def full_name():
                try:
                    user_get = vk.users.get(user_ids=event.obj['message']['from_id'])
                    first_name = user_get[0]['first_name'].replace("ъ", "")
                    last_name = user_get[0]['last_name'].replace("ъ", "")
                    return first_name + " " + last_name
                except BaseException as ex:
                    print(ex)
                    send_message(id, "Ошибка пользователя.")
                    return ""

            def fixation():
                flag = False
                for num, i in enumerate(queue[id]):
                    if qu.get_name() == i.get_name():
                        flag = True
                        queue[id][num] = qu
                        return "+-"
                if not flag:
                    queue[id].append(copy.deepcopy(qu))
                    return "+"
                if not os.path.exists(f"{os.path.dirname(os.getcwd())}\\queue_file"):
                    os.mkdir(f"{os.path.dirname(os.getcwd())}\\queue_file")
                with open(f"{os.path.dirname(os.getcwd())}\\queue_file\\queue.pkl", 'wb') as f:
                    pickle.dump(queue, f)

            id = event.obj['message']['peer_id']
            if id not in state:
                state[id] = []
            if id not in queue:
                queue[id] = []
            if id not in buf:
                buf[id] = []
                buf[id].append(Queue())
                buf[id].append(False)
                buf[id].append(False)
            qu = buf[id][0]
            have_queue = buf[id][1]
            have_name = buf[id][2]
            msg = event.obj['message']['text'].lower()
            if "#" in msg:
                print(f"Get {msg}")
            if len(state[id]) != 0:
                if state[id][0] == "подтверждение":
                    if msg == "[club219286730|@queue_fixation] да":
                        buf[id][0] = state[id][1]
                        state[id].clear()
                        send_message(id, f"Очередь была сменена на '{buf[id][0].get_name()}'")
                    elif msg == "[club219286730|@queue_fixation] нет":
                        state[id].clear()
                        send_message(id, "Смена очереди отменена.")
                elif state[id][0] == "удаление":
                    if msg == "[club219286730|@queue_fixation] да":
                        queue[id].pop(state[id][1])
                        with open(f"{os.path.dirname(os.getcwd())}\\queue_file\\queue.pkl", 'wb') as f:
                            pickle.dump(queue, f)
                        send_message(id, "Очередь удалена с сервера. Однако в случае записи в очередь людей и при этом "
                                         "у очереди будет имя, она сохранится автоматически. Чтобы полностью удалить, "
                                         "вызовите #выход")
                        state[id].clear()
                    elif msg == "[club219286730|@queue_fixation] нет":
                        state[id].clear()
                        send_message(id, "Удаление очереди отменено.")
            elif msg == "#запуск" and not have_queue or msg == "#начать" and not have_queue:
                buf[id][1] = True
                send_message(id,
                             "Очередь запущена. Чтобы добавить себя в очередь, "
                             "напишите #фиксирую. Чтобы убрать очередь, напишите #выход. "
                             "Чтобы получить все команды очереди, введите #помощь")
            elif msg == "#запуск" and have_queue:
                send_message(id, "Очередь уже запущена")
            elif msg in commands and not have_queue:
                send_message(id, "Очередь не запущена. Чтобы запустить очередь, напишите #запуск")
            elif msg == "#выход" and have_queue:
                buf[id][1] = False
                qu.clear()
                send_message(id, "Очередь выключена.")
            elif msg == "#выход" and not have_queue:
                send_message(id, "В данный момент очереди нет. "
                                 "Чтобы запустить, используйте команду #запуск")
            elif "#фиксирую" in msg and have_queue:
                try:
                    if qu.add(full_name()):
                        send_message(id, f"{full_name()} внесен(а) в очередь")
                        if have_name:
                            fixation()
                    else:
                        send_message(id, f"{full_name()} уже в очереди.")
                except BaseException as ex:
                    print(ex)
                    send_message(id, "Ошибка добавления в очередь")
            elif "#имя" in msg and have_queue:
                name = event.obj['message']['text']
                name = name.replace("#имя", "").strip()
                name = name.replace("#Имя", "").strip()
                qu.set_name(name)
                buf[id][2] = True
                send_message(id, f"Установлено имя: {name}")
            elif "#описание" in msg and have_queue:
                msg = msg.replace("#описание", "").strip()
                qu.set_description(msg)
                send_message(id, f"Установлено описание: {msg}")
            elif msg == "#поп":
                deleted = qu.pop()
                if deleted == "-":
                    send_message(id, "Очередь пуста")
                else:
                    if have_name:
                        fixation()
                    send_message(id, f"{deleted} был удалён из очереди")
            elif msg == "#выхожу":
                try:
                    user_get = vk.users.get(user_ids=event.obj['message']['from_id'])
                    first_name = user_get[0]['first_name']
                    last_name = user_get[0]['last_name']
                    if qu.quit(first_name + " " + last_name):
                        if have_name:
                            fixation()
                        send_message(id, f"{first_name} {last_name} вышел(вышла) из очереди")
                    else:
                        send_message(id, f"{first_name} {last_name} не в очереди")
                except BaseException as ex:
                    print(ex)
                    send_message(id, "Ошибка выхода из очереди")
            elif msg == "#очередь":
                res1 = qu.show()
                res2 = qu.info()
                if res1 == "-" and res2 == "":
                    send_message(id, "Очередь пуста")
                else:
                    result = qu.info() + "\n" + qu.show()
                    send_message(id, result)
            elif msg == "#фиксация":
                if qu.get_name() == "":
                    send_message(id, "Нельзя сохранить очередь без названия")
                else:
                    if fixation() == "+":
                        send_message(id, "Очередь сохранена.")
                    else:
                        send_message(id, "Очередь перезаписана")
            elif msg == "#анфикс":
                flag = False
                for num, i in enumerate(queue[id]):
                    if qu.get_name() == i.get_name():
                        flag = True
                        keyboard = VkKeyboard(inline=True)
                        keyboard.add_button("Да", color=VkKeyboardColor.POSITIVE)
                        keyboard.add_button("Нет", color=VkKeyboardColor.NEGATIVE)
                        vk.messages.send(
                            peer_id=id,
                            random_id=get_random_id(),
                            message="Смена очереди приведёт к потере текущей"
                                    " очереди. Чтобы сохранить очередь, можете использовать команду #фиксация."
                                    " Удалить очередь?", keyboard=keyboard.get_keyboard())
                        state[id].append("удаление")
                        state[id].append(num)
                if not flag:
                    send_message(id, "Очередь не на сервере.")
            elif msg == "#очереди":
                result = ""
                for i in queue[id]:
                    result += i.get_name() + "\n"
                if result == "":
                    send_message(id, "Очередей нет.")
                else:
                    send_message(id, "Очереди:\n" + result)
            elif "#перейти" in msg:
                name = event.obj['message']['text']
                name = name.replace("#перейти", "").strip()
                flag = False
                for i in queue[id]:
                    if i.get_name() == name:
                        flag = True
                        if not have_queue:
                            buf[id][0] = i
                            buf[id][1] = True
                            send_message(id, "Очередь была сменена")
                        else:
                            state[id].append("подтверждение")
                            state[id].append(i)
                            keyboard = VkKeyboard(inline=True)
                            keyboard.add_button("Да", color=VkKeyboardColor.POSITIVE)
                            keyboard.add_button("Нет", color=VkKeyboardColor.NEGATIVE)
                            vk.messages.send(
                                peer_id=id,
                                random_id=get_random_id(),
                                message="Смена очереди приведёт к потере текущей"
                                        " очереди. Чтобы сохранить очередь, можете использовать команду #фиксация."
                                        " Сменить очередь?", keyboard=keyboard.get_keyboard())
                if not flag:
                    send_message(id, "Очередь не найдена.")
            elif msg == "#пропустить":
                try:
                    res = qu.swap(full_name())
                    if res == "1":
                        send_message(id, "Недостаточно человек в очереди")
                    elif res == "max":
                        send_message(id, "Последний в очереди, некого пропускать")
                    elif res == "none":
                        send_message(id, f"{full_name()} не в очереди")
                    elif res == "*":
                        send_message(id, f"{full_name()} заморожен(а) и не может меняться местами.")
                    else:
                        send_message(id, f"{full_name()} пропустил человека вперёд")
                except BaseException as ex:
                    print(ex)
                    send_message(id, "Ошибка пропуска человека")
            elif msg == "#заморозка":
                res = qu.freeze(full_name())
                if res == "+":
                    send_message(id, f"{full_name()} был(а) заморожен(а). Чтобы разморозиться, введите #разморозка")
                elif res == "+-":
                    send_message(id, f"{full_name()} уже заморожен(а).")
                else:
                    send_message(id, f"{full_name()} не в очереди.")
            elif msg == "#разморозка":
                res = qu.unfreeze(full_name())
                if res == "+":
                    send_message(id, f"{full_name()} был(а) разморожен(а).")
                elif res == "+-":
                    send_message(id, f"{full_name()} не заморожен(а).")
                else:
                    send_message(id, f"{full_name()} не в очереди.")
            elif "#покажи" in msg:
                name = event.obj['message']['text']
                name = name.replace("#покажи", "").strip()
                flag = False
                for i in queue[id]:
                    if i.get_name() == name:
                        flag = True
                        res1 = i.show()
                        res2 = i.info()
                        if res1 == "-" and res2 == "":
                            send_message(id, "Очередь пуста")
                        else:
                            result = res2 + "\n" + res1
                            send_message(id, result)
                if not flag:
                    send_message(id, "Такой очереди не существует.")
            elif msg == "#помощь":
                send_message(id, "#запуск – создать очередь\n"
                                 "#выход – закрыть очередь\n"
                                 "#имя [имя] – пишите команду #имя и через пробел название для очереди\n"
                                 "#описание [описание] – пишите команду #описание и через пробел описание для очереди\n"
                                 "#фиксирую – добавить себя в очередь\n"
                                 "#поп – удалить первого участника из очереди, если он прошёл\n"
                                 "#выхожу – удалить себя из очереди\n"
                                 "#очередь – вывести очередь\n"
                                 "#фиксация – сохранить очередь на сервер или обновить очередь(перезаписать)\n"
                                 "#анфикс – удалить очередь с сервера\n"
                                 "#очереди – вывести все сохранённые очереди\n"
                                 "#перейти [название] – перейти в очередь по названию. Обратите внимание, "
                                 "что текущая очередь автоматически сохранена не будет!\n"
                                 "#пропустить – пропустить человека вперёд себя \n"
                                 "#покажи [название] – вывести всю информацию об очереди не переходя в неё\n"
                                 "#заморозка – 'заморозиться' – в "
                                 "случае, если вы не можете быть на определённой позиции в очереди и хотите пропустить"
                                 " больше, чем одного человека. Когда мы заморожены, при использовании #поп"
                                 "вы не пропадаете из очереди.\nПриведу пример. Вы находитесь на 2 позиции, но поняли,"
                                 "что хотите сдать пятым. Вы замораживаетесь, и при пропуске сначала уйдёт 1, потом 3,"
                                 "а вы останетесь замороженным. \n"
                                 "#разморозка – убрать эффект заморозки"
                             )
