import os
import sys

import requests.exceptions
import vk_api
from vk_api.keyboard import VkKeyboard, VkKeyboardColor
from vk_api.longpoll import VkLongPoll, VkEventType
from private_api import *
from vk_api.bot_longpoll import VkBotLongPoll, VkBotEventType
from vk_api.utils import get_random_id
import copy
import pickle
from threading import Thread
import time


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
            result += f"{i + 1}) "
            if self.humans_freeze[i]:
                result += "❄"
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
                self.humans_freeze.pop(i)
                return self.queued_humans.pop(i)
        return "-"

    def quit(self, man) -> bool:
        for num, i in enumerate(self.queued_humans):
            if i == man:
                self.queued_humans.pop(num)
                self.humans_freeze.pop(num)
                return True
        return False

    def get_name(self) -> str:
        return self.name

    def get_first(self) -> str:
        if len(self.queued_humans) != 0:
            for i in range(len(self.queued_humans)):
                if not self.humans_freeze[i]:
                    return self.queued_humans[i]
            return ""
        else:
            return ""

    def swap(self, man) -> str:
        if len(self.queued_humans) < 1:
            return "1"
        for num, i in enumerate(self.queued_humans):
            if i == man:
                if num + 1 > len(self.queued_humans) - 1:
                    return "max"
                if self.humans_freeze[num]:
                    return "*"
                while num < len(self.queued_humans) - 1:
                    if self.humans_freeze[num]:
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
                if self.humans_freeze[num]:
                    return "+-"
                self.humans_freeze[num] = True
                return "+"
        return "-"

    def unfreeze(self, man) -> str:
        for num, i in enumerate(self.queued_humans):
            if i == man:
                if not self.humans_freeze[num]:
                    return "+-"
                self.humans_freeze[num] = False
                return "+"
        return "-"


def fixation(id, queue, qu):
    path = os.path.dirname(os.getcwd())
    for num, i in enumerate(queue[id]):
        if qu.get_name() == i.get_name():
            queue[id][num] = copy.deepcopy(qu)
            if not os.path.exists(f"{path}\\queue_file"):
                os.mkdir(f"{path}\\queue_file")
            with open(f"{path}\\queue_file\\queue.pkl", 'wb') as f:
                pickle.dump(queue, f)
            return False
    queue[id].append(copy.deepcopy(qu))
    if not os.path.exists(f"{path}\\queue_file"):
        os.mkdir(f"{path}\\queue_file")
    with open(f"{path}\\queue_file\\queue.pkl", 'wb') as f:
        pickle.dump(queue, f)
    return True


def exit_any():
    while True:
        print("Enter exit to finish process")
        intent = input()
        if intent.lower() == "exit":
            os._exit(0)


def main():
    buf = {}
    commands = "#имя #описание #фиксирую #поп #выхожу #очередь #фиксация #анфикс #пропустить #заморозка #разморозка"
    commands = commands.split()
    Thread(target=exit_any, args=()).start()
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

    def send_message(id, msg, stiker=None, attach=None):
        try:
            vk.messages.send(random_id=get_random_id(),
                             peer_id=id,
                             message=msg)
        except BaseException as ex:
            print(ex)
            return

    def send_photo(peer_id, img_req, message=None):
        upload = vk_api.VkUpload(vk_session)
        photo = upload.photo_messages(img_req)[0]
        owner_id = photo['owner_id']
        photo_id = photo['id']
        attachment = f'photo{owner_id}_{photo_id}'
        post = {'peer_id': peer_id, 'random_id': 0, "attachment": attachment}
        if message is not None:
            post['message'] = message
        try:
            vk_session.method('messages.send', post)
        except BaseException:
            send_message(id, "Не удалось отправить картинку")
            return

    def unfix(id, queue, name):
        flag = False
        for num, i in enumerate(queue[id]):
            if name == i.get_name():
                flag = True
                keyboard = VkKeyboard(inline=True)
                keyboard.add_button("Да", color=VkKeyboardColor.POSITIVE)
                keyboard.add_button("Нет", color=VkKeyboardColor.NEGATIVE)
                vk.messages.send(
                    peer_id=id,
                    random_id=get_random_id(),
                    message="Вы уверены. что хотите"
                            " удалить очередь?", keyboard=keyboard.get_keyboard())
                state[id].append("удаление")
                state[id].append(num)
        if not flag:
            send_message(id, "Очередь не на сервере.")

    def do_wait(buf, id):
        time.sleep(120)
        buf[id][4] = False
        send_message(id, "Можете фиксировать.")

    def pop_timer(buf, id):
        time.sleep(5)
        buf[id][5] = False

    count = 0
    have_queue = False
    for event in longpoll.listen():
        if event.type == VkBotEventType.MESSAGE_NEW and event.from_chat:
            id = event.obj['message']['peer_id']

            # print(event.obj)
            # send_message(id,"удолю")
            # vk.messages.delete(message_ids=int(event.obj['message']['conversation_message_id'])+1, delete_for_all=1)

            def full_name():
                try:
                    bukvi = "йцукенгшщзхъфывапролджэячсмитьбюё"
                    user_get = vk.users.get(user_ids=event.obj['message']['from_id'])
                    first_name = user_get[0]['first_name'].replace("ъ", "")
                    last_name = user_get[0]['last_name'].replace("ъ", "")
                    while first_name.find("i") != -1:
                        i = first_name.find("i")
                        if first_name[i + 1] in bukvi or first_name[i - 1] in bukvi:
                            first_name = first_name.replace("i", "и", 1)
                        else:
                            break
                    while last_name.find("i") != -1:
                        i = last_name.find("i")
                        if last_name[i + 1] in bukvi or last_name[i - 1] in bukvi:
                            last_name = last_name.replace("i", "", 1)
                        else:
                            break
                    return first_name + " " + last_name
                except BaseException as ex:
                    print(ex)
                    send_message(id, "Ошибка пользователя.")
                    return ""

            if id not in state:
                state[id] = []
            if id not in queue:
                queue[id] = []
            if id not in buf:
                buf[id] = []
                buf[id].append(Queue())
                buf[id].append(False)
                buf[id].append(False)
                buf[id].append(False)
                buf[id].append(False)
                buf[id].append(False)
            qu = buf[id][0]
            have_queue = buf[id][1]
            have_name = buf[id][2]
            no_message = buf[id][3]
            waiting = buf[id][4]
            pop_wait = buf[id][5]
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
                elif state[id][0] == "завершить":
                    if msg == "[club219286730|@queue_fixation] да":
                        buf[id][1] = False
                        buf[id][0].clear()
                        state[id].clear()
                        send_message(id, "Очередь выключена.")
                    elif msg == "[club219286730|@queue_fixation] нет":
                        state[id].clear()
                        send_message(id, "Завершение очереди отменено.")
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
                buf[id][4] = True
                Thread(target=do_wait, args=(buf, id,)).start()
                keyboard = VkKeyboard(inline=True)
                keyboard.add_button("#фиксирую", color=VkKeyboardColor.POSITIVE)
                vk.messages.send(
                    peer_id=id,
                    random_id=get_random_id(),
                    message="@all, Очередь запущена. Фиксировать можно через 2 минуты. Чтобы добавить себя в очередь, "
                            "напишите #фиксирую. Чтобы убрать очередь, напишите #выход. "
                            "Чтобы получить все команды очереди, введите #помощь", keyboard=keyboard.get_keyboard())
            elif "#запуск" in msg and not have_queue:
                name = event.obj['message']['text']
                name = name.replace("#запуск", "").strip()
                name = name.replace("#Запуск", "").strip()
                flag = False
                for i in queue[id]:
                    if i.get_name() == name:
                        flag = True
                        buf[id][0] = copy.deepcopy(i)
                        buf[id][1] = True
                        buf[id][2] = True
                        send_message(id, f"Очередь {name} была запущена.")
                if not flag:
                    send_message(id, "Очередь не найдена.")
            elif "#запуск" in msg and have_queue:
                send_message(id, "Очередь уже запущена.")
            elif msg == "#запуск" and have_queue:
                send_message(id, "Очередь уже запущена")
            elif msg in commands and not have_queue:
                send_message(id, "Очередь не запущена. Чтобы запустить очередь, напишите #запуск")
            elif msg == "#выход" and have_queue:
                keyboard = VkKeyboard(inline=True)
                keyboard.add_button("Да", color=VkKeyboardColor.POSITIVE)
                keyboard.add_button("Нет", color=VkKeyboardColor.NEGATIVE)
                vk.messages.send(
                    peer_id=id,
                    random_id=get_random_id(),
                    message="Вы уверены, что хотите"
                            " завершить очередь?", keyboard=keyboard.get_keyboard())
                state[id].append("завершить")
            elif msg == "#выход" and not have_queue:
                send_message(id, "В данный момент очереди нет. "
                                 "Чтобы запустить, используйте команду #запуск")
            elif "#фиксирую" in msg and have_queue:
                if not waiting:
                    try:
                        if qu.add(full_name()):
                            if not no_message:
                                send_message(id, f"{full_name()} внесен(а) в очередь")
                            if have_name:
                                fixation(id, queue, qu)
                        else:
                            send_message(id, f"{full_name()} уже в очереди.")
                    except BaseException as ex:
                        print(ex)
                        send_message(id, "Ошибка добавления в очередь")
                else:
                    send_message(id, "Ожидание начала очереди, вы не внесены.")
            elif "#добавить" in msg and have_queue:
                name = event.obj['message']['text']
                name = name.replace("#добавить", "").strip()
                name = name.replace("#Добавить", "").strip()
                if qu.add(name):
                    if not no_message:
                        send_message(id, f"{name} внесен(а) в очередь")
                    if have_name:
                        fixation(id, queue, qu)
                else:
                    send_message(id, f"{name} уже в очереди.")
            elif ("#имя" in msg or "#название" in msg) and have_queue:
                name = event.obj['message']['text']
                name = name.replace("#имя", "").strip()
                name = name.replace("#Имя", "").strip()
                name = name.replace("#название", "").strip()
                name = name.replace("#Название", "").strip()
                qu.set_name(name)
                buf[id][2] = True
                if not no_message:
                    send_message(id, f"Установлено имя: {name}")
            elif "#описание" in msg and have_queue:
                msg = msg.replace("#описание", "").strip()
                qu.set_description(msg)
                if not no_message:
                    send_message(id, f"Установлено описание: {msg}")
            elif msg == "#поп":
                if not pop_wait:
                    deleted = qu.pop()
                    if deleted == "-":
                        send_message(id, "Очередь пуста")
                    else:
                        if have_name:
                            fixation(id, queue, qu)
                        res = ""
                        if not no_message:
                            res += f"{deleted} был(а) удален(а) из очереди\n"
                        next = qu.get_first()
                        if next != "":
                            res += f"Следующий(-ая): {next}"
                        send_message(id, res)
                        buf[id][5] = True
                        Thread(target=pop_timer, args=(buf, id,)).start()
                else:
                    send_message(id, "Защита двойного удаления, 5сек.")
            elif msg == "#выхожу":
                try:
                    if qu.quit(full_name()):
                        if have_name:
                            fixation(id, queue, qu)
                        if not no_message:
                            send_message(id, f"{full_name()} вышел(вышла) из очереди")
                    else:
                        send_message(id, f"{full_name()} не в очереди")
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
                    if fixation(id, queue, qu):
                        send_message(id, "Очередь сохранена.")
                    else:
                        send_message(id, "Очередь перезаписана")
            elif msg == "#анфикс":
                unfix(id, queue, qu.get_name())
            elif msg == "#резня":
                unfix(id, queue, qu.get_name())
                buf[id][0].clear()
                buf[id][1] = False
                buf[id][2] = False
                buf[id][3] = False
                send_photo(id, "photo/killthemall.jpg")
            elif "#анфикс" in msg:
                name = event.obj['message']['text']
                name = name.replace("#анфикс", "").strip()
                name = name.replace("#Анфикс", "").strip()
                unfix(id, queue, name)
            elif msg == "#очереди":
                result = ""
                for num, i in enumerate(queue[id]):
                    result += f"{num + 1}) {i.get_name()}\n"
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
                            buf[id][0] = copy.deepcopy(i)
                            buf[id][1] = True
                            buf[id][2] = True
                            send_message(id, "Очередь была сменена")
                        else:
                            state[id].append("подтверждение")
                            state[id].append(copy.deepcopy(i))
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
                if not no_message:
                    if res == "+":
                        send_message(id, f"{full_name()} был(а) заморожен(а). Чтобы разморозиться, введите #разморозка")
                    elif res == "+-":
                        send_message(id, f"{full_name()} уже заморожен(а).")
                    else:
                        send_message(id, f"{full_name()} не в очереди.")
            elif msg == "#разморозка":
                res = qu.unfreeze(full_name())
                if not no_message:
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
            elif "#гото" in msg:
                msg = msg.replace("#гото", "").strip()
                flag = False
                try:
                    num = int(msg)
                except ValueError:
                    send_message(id, "Ошибка конвертации в число, возможно присутствуют символы")
                    flag = True
                if not flag:
                    if num == 0:
                        num = 1
                    if len(queue[id]) < num or num < 1:
                        send_message(id, "Очереди по этому порядковому номеру не существует.")
                    elif not have_queue:
                        buf[id][0] = copy.deepcopy(queue[id][num - 1])
                        buf[id][1] = True
                        send_message(id, "Очередь была сменена")
                    else:
                        state[id].append("подтверждение")
                        state[id].append(copy.deepcopy(queue[id][num - 1]))
                        keyboard = VkKeyboard(inline=True)
                        keyboard.add_button("Да", color=VkKeyboardColor.POSITIVE)
                        keyboard.add_button("Нет", color=VkKeyboardColor.NEGATIVE)
                        vk.messages.send(
                            peer_id=id,
                            random_id=get_random_id(),
                            message="Смена очереди приведёт к потере текущей"
                                    " очереди. Чтобы сохранить очередь, можете использовать команду #фиксация."
                                    " Сменить очередь?", keyboard=keyboard.get_keyboard())
            elif msg == "#молчи":
                if no_message:
                    send_message(id, "Бот и так молчит.")
                else:
                    buf[id][3] = True
                    send_message(id, "Бот замолчал. Теперь он не будет отправлять сообщение на каждое сообщение. "
                                     "Например, не будет отправлять на сообщение #фиксирую, "
                                     "только на команды и ошибки.")
            elif msg == "#говори":
                if not no_message:
                    send_message(id, "Бот и так говорит.")
                else:
                    buf[id][3] = False
                    send_message(id, "Теперь бот снова будет отвечать на сообщения #фиксирую")
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
                                 "#гото [номер] – перейти в очередь по номеру.\n"
                                 "#пропустить – пропустить человека вперёд себя \n"
                                 "#покажи [название] – вывести всю информацию об очереди не переходя в неё\n"
                                 "#заморозка – 'заморозиться' – в "
                                 "случае, если вы не можете быть на определённой позиции в очереди и хотите пропустить"
                                 " больше, чем одного человека. Когда мы заморожены, при использовании #поп"
                                 "вы не пропадаете из очереди.\nПриведу пример. Вы находитесь на 2 позиции, но поняли,"
                                 "что хотите сдать пятым. Вы замораживаетесь, и при пропуске сначала уйдёт 1, потом 3,"
                                 "а вы останетесь замороженным. \n"
                                 "#разморозка – убрать эффект заморозки\n"
                                 "#молчи – не отправлять сообщения на каждое действие.\n"
                                 "#говори – снова отправлять сообщения на действие\n"
                                 "#добавить [имя] – добавить определённого человека в очередь"
                             )


if __name__ == "__main__":
    while True:
        try:
            main()
        except requests.exceptions.ReadTimeout:
            print("readtimeout")
            time.sleep(600)
