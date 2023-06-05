import os
import sys

import requests.exceptions
import vk_api
from vk_api.bot_longpoll import VkBotLongPoll, VkBotEventType
from vk_api.utils import get_random_id
import copy
import pickle
from threading import Thread
import time
from global_defs import vk, vk_session, longpoll, send_message, full_name
from queue_defs import *
from mongo_defs import create_queue, open_queue_name, quit_queue, set_queue_name, setup_listener, add_fix, commit, \
    all_queue, set_queue_description, goto, pop, out, freeze


def main():
    condition = {}
    commands = "#имя #описание #фиксирую #поп #выхожу #очередь #фиксация #анфикс #пропустить #заморозка #разморозка"
    commands = commands.split()
    Thread(target=exit_any, args=()).start()
    print("Bot started")
    conversations = vk.messages.getConversations()
    state = {}
    if not os.path.isfile(f'{os.path.dirname(os.getcwd())}\\queue_file\\queue.pkl'):
        queue = {}
    else:
        with open(f'{os.path.dirname(os.getcwd())}\\queue_file\\queue.pkl', 'rb') as f:
            queue = pickle.load(f)
            print("Queue loaded")

    def unfix(id, queue, name, kill=False):
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
        if not flag and not kill:
            send_message(id, "Очередь не на сервере.")

    count = 0
    have_queue = False
    Thread(target=setup_listener, args=(condition,)).start()
    for event in longpoll.listen():
        if event.type == VkBotEventType.MESSAGE_NEW and event.from_chat:
            id = event.obj['message']['peer_id']
            #send_message(id, f"*id{event.obj['message']['from_id']}")
            # print(event.obj)
            # send_message(id,"удолю")
            # vk.messages.delete(message_ids=int(event.obj['message']['conversation_message_id'])+1, delete_for_all=1)

            if id not in state:
                state[id] = []
            if id not in queue:
                queue[id] = []
            if id not in condition:
                condition[id] = []
                condition[id].append(Queue())
                condition[id].append(False)
                condition[id].append(False)
                condition[id].append(False)
                condition[id].append(False)
                condition[id].append(False)
            qu = condition[id][0]
            have_queue = condition[id][1]
            have_name = condition[id][2]
            no_message = condition[id][3]
            waiting = condition[id][4]
            pop_wait = condition[id][5]
            msg = event.obj['message']['text'].lower()
            if "#" in msg:
                print(f"Get {msg}")
            if len(state[id]) != 0:
                commit(state, id, condition, msg,queue)
            elif msg == "#запуск" and not have_queue or msg == "#начать" and not have_queue or msg == "#старт" and not have_queue:
                create_queue(condition, id, event)
            elif "#запуск" in msg and not have_queue:
                name = event.obj['message']['text']
                name = name.replace("#запуск", "").strip()
                name = name.replace("#Запуск", "").strip()
                if name.isdigit():
                    create_queue(condition, id, event, int(name))
                else:
                    open_queue_name(name, id, condition)
            elif "#запуск" in msg and have_queue:
                send_message(id, "Очередь уже запущена.")
            elif msg == "#запуск" and have_queue:
                send_message(id, "Очередь уже запущена")
            elif msg in commands and not have_queue:
                send_message(id, "Очередь не запущена. Чтобы запустить очередь, напишите #запуск")
            elif msg == "#закрыть" and have_queue:
                quit_queue(id, state)
            elif msg == "#закрыть" and not have_queue:
                send_message(id, "В данный момент очереди нет. "
                                 "Чтобы запустить, используйте команду #запуск")
            elif "#фиксирую" in msg and have_queue:
                if not waiting:
                    add_fix(qu, id, no_message, event)
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
                set_queue_name(qu, name)
                condition[id][2] = True
                if not no_message:
                    send_message(id, f"Установлено имя: {name}")
            elif "#описание" in msg and have_queue:
                msg = msg.replace("#описание", "").strip()
                set_queue_description(qu, msg)
                if not no_message:
                    send_message(id, f"Установлено описание: {msg}")
            elif msg == "#поп":
                pop(id, qu, pop_wait, no_message, condition, event)
            elif msg == "#выхожу":
                out(id, qu, no_message, event)
            elif msg == "#очередь":
                res1 = qu.show()
                res2 = qu.info()
                if res1 == "-" and res2 == "":
                    send_message(id, "Очередь пуста")
                else:
                    result = qu.info() + "\n" + qu.show()
                    send_message(id, result)
            elif msg == "#анфикс":
                unfix(id, queue, qu.get_name())
            elif msg == "#резня":
                unfix(id, queue, qu.get_name(), True)
                condition[id][0].clear()
                condition[id][1] = False
                condition[id][2] = False
                condition[id][3] = False
                send_photo(id, "photo/killthemall.jpg")
            elif "#анфикс" in msg:
                name = event.obj['message']['text']
                name = name.replace("#анфикс", "").strip()
                name = name.replace("#Анфикс", "").strip()
                unfix(id, queue, name)
            elif msg == "#очереди":
                all_queue(id)
            elif "#перейти" in msg:
                name = event.obj['message']['text']
                name = name.replace("#перейти", "").strip()
                open_queue_name(name, id, condition)
            elif msg == "#пропустить":
                #skip(qu, id, event)
                send_message(id, "Временно не работает")
            elif msg == "#заморозка":
                freeze(id, qu, event)
                #res = qu.freeze(full_name(event))
                # if not no_message:
                #     if res == "+":
                #         send_message(id, f"{full_name(event)} был(а) заморожен(а). Чтобы разморозиться, введите #разморозка")
                #     elif res == "+-":
                #         send_message(id, f"{full_name(event)} уже заморожен(а).")
                #     else:
                #         send_message(id, f"{full_name(event)} не в очереди.")
            elif msg == "#разморозка":
                freeze(id, qu, event, True)
                """res = qu.unfreeze(full_name(event))
                if not no_message:
                    if res == "+":
                        send_message(id, f"{full_name(event)} был(а) разморожен(а).")
                    elif res == "+-":
                        send_message(id, f"{full_name(event)} не заморожен(а).")
                    else:
                        send_message(id, f"{full_name(event)} не в очереди.")"""
            elif "#покажи" in msg:
                name = event.obj['message']['text']
                name = name.replace("#покажи", "").strip()
                cout(name, id, queue)
            elif "#гото" in msg:
                goto(msg, id, condition, have_queue)
            elif msg == "#молчи":
                if no_message:
                    send_message(id, "Бот и так молчит.")
                else:
                    condition[id][3] = True
                    send_message(id, "Бот замолчал. Теперь он не будет отправлять сообщение на каждое сообщение. "
                                     "Например, не будет отправлять на сообщение #фиксирую, "
                                     "только на команды и ошибки.")
            elif msg == "#говори":
                if not no_message:
                    send_message(id, "Бот и так говорит.")
                else:
                    condition[id][3] = False
                    send_message(id, "Теперь бот снова будет отвечать на сообщения #фиксирую")
            elif msg == "#помощь":
                send_message(id, "#запуск – создать очередь\n"
                                 "#закрыть – закрыть очередь\n"
                                 "#имя [имя] – пишите команду #имя и через пробел название для очереди\n"
                                 "#описание [описание] – пишите команду #описание и через пробел описание для очереди\n"
                                 "#фиксирую – добавить себя в очередь\n"
                                 "#поп – удалить первого участника из очереди, если он прошёл\n"
                                 "#выхожу – удалить себя из очереди\n"
                                 "#очередь – вывести очередь\n"
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
        except Exception as ex:
            print(ex)
