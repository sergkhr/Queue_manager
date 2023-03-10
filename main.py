import os

import vk_api
from vk_api.keyboard import VkKeyboard, VkKeyboardColor
from vk_api.longpoll import VkLongPoll, VkEventType
from private_api import *
from vk_api.bot_longpoll import VkBotLongPoll, VkBotEventType
from vk_api.utils import get_random_id
import pickle


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
            result += f"{i + 1}) {who}"
        return result

    def add(self, full_name):
        if full_name not in self.queued_humans:
            self.queued_humans.append(full_name)
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
        self.name = ""
        self.description = ""

    def pop(self) -> str:
        if len(self.queued_humans) != 0:
            result = self.queued_humans[0]
            self.queued_humans.pop(0)
            return result
        else:
            return "-"

    def quit(self, man) -> bool:
        for num, i in enumerate(self.queued_humans):
            if i == man:
                self.queued_humans.pop(num)
                return True
        return False

    def get_name(self):
        return self.name


def send_message(id, msg, stiker=None, attach=None):
    try:
        vk.messages.send(random_id=get_random_id(),
                         peer_id=id,
                         message=msg)
    except BaseException as ex:
        print(ex)
        return

buf = {}
commands = "#имя #описание #фиксирую #поп #выхожу #очередь #фиксация #анфикс"
if __name__ == "__main__":
    vk_session = vk_api.VkApi(token=token_api)
    longpoll = VkBotLongPoll(vk_session, 219286730)
    vk = vk_session.get_api()
    conversations = vk.messages.getConversations()
    state = {}
    if not os.path.isfile('queue.pkl'):
        queue = {}
    else:
        with open('queue.pkl', 'rb') as f:
            queue = pickle.load(f)
    count = 0
    have_queue = False
    for event in longpoll.listen():
        if event.type == VkBotEventType.MESSAGE_NEW and event.from_chat:
            id = event.obj['message']['peer_id']
            if id not in state:
                state[id] = []
            if id not in queue:
                queue[id] = []
            if id not in buf:
                buf[id] = []
                buf[id].append(Queue())
                buf[id].append(False)
            qu = buf[id][0]
            have_queue = buf[id][1]
            msg = event.obj['message']['text']
            if len(state[id]) != 0:
                if state[id][0] == "подтверждение":
                    if msg == "[club219286730|@queue_fixation] Да":
                        qu = state[id][1]
                        state[id].clear()
                        send_message(id, f"Очередь была сменена на '{qu.get_name()}'")
                    elif msg == "[club219286730|@queue_fixation] Нет":
                        state[id].clear()
                        send_message(id, "Смена очереди отменена.")
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
                    user_get = vk.users.get(user_ids=event.obj['message']['from_id'])
                    first_name = user_get[0]['first_name']
                    last_name = user_get[0]['last_name']
                    if qu.add(first_name + " " + last_name):
                        send_message(id, f"{first_name} {last_name} внесен(а) в очередь")
                    else:
                        send_message(id, f"{first_name} {last_name} уже в очереди.")
                except BaseException as ex:
                    print(ex)
                    send_message(id, "Ошибка добавления в очередь")
            elif "#имя" in msg and have_queue:
                msg = msg.replace("#имя", "").strip()
                qu.set_name(msg)
                send_message(id, f"Установлено имя: {msg}")
            elif "#описание" in msg and have_queue:
                msg = msg.replace("#описание", "").strip()
                qu.set_description(msg)
                send_message(id, f"Установлено описание: {msg}")
            elif msg == "#поп":
                deleted = qu.pop()
                if deleted == "-":
                    send_message(id, "Очередь пуста")
                else:
                    send_message(id, f"{deleted} был удалён из очереди")
            elif msg == "#выхожу":
                try:
                    user_get = vk.users.get(user_ids=event.obj['message']['from_id'])
                    first_name = user_get[0]['first_name']
                    last_name = user_get[0]['last_name']
                    if qu.quit(first_name + " " + last_name):
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
                    flag = False
                    for num, i in enumerate(queue[id]):
                        if qu.get_name() == i.get_name():
                            flag = True
                            queue[id][num] = qu
                            send_message(id, "Очередь перезаписана")
                    if not flag:
                        queue[id].append(qu)
                        send_message(id, "Очередь сохранена.")
                    with open("queue.pkl", 'wb') as f:
                        pickle.dump(queue, f)
            elif msg == "#анфикс":
                flag = False
                for num, i in enumerate(queue[id]):
                    if qu.get_name() == i.get_name():
                        flag = True
                        queue[id].pop(num)
                        with open("queue.pkl", 'wb') as f:
                            pickle.dump(queue, f)
                        send_message(id, "Очередь удалена с сервера.")
                if not flag:
                    send_message(id, "Очередь не была сохранена.")
            elif msg == "#очереди":
                result = ""
                for i in queue[id]:
                    result += i.get_name() + "\n"
                if result == "":
                    send_message(id, "Очередей нет.")
                else:
                    send_message(id, "Очереди:\n" + result)
            elif "#перейти" in msg:
                msg = msg.replace("#перейти", "").strip()
                flag = False
                for i in queue[id]:
                    if i.get_name() == msg:
                        flag = True
                        if not have_queue:
                            qu = i
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
                                message="Смена очереди приведёт к потере "
                                        "текущей очереди. Чтобы сохранить очередь, можете использовать команду #фиксация."
                                        " Сменить очередь?", keyboard=keyboard.get_keyboard())
                if not flag:
                    send_message(id, "Очередь не найдена.")
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
                                 "что текущая очередь автоматически сохранена не будет!"

                             )
