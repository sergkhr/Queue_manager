import pickle
import os
import copy
from vk_api.bot_longpoll import VkBotLongPoll, VkBotEventType
from private_api import *
from classes import *
import vk_api
from vk_api.utils import get_random_id
from threading import Thread
from vk_api.keyboard import VkKeyboard, VkKeyboardColor
import time

vk_session = vk_api.VkApi(token=token_api)
longpoll = VkBotLongPoll(vk_session, 219286730)
vk = vk_session.get_api()


def send_message(id, msg, stiker=None, attach=None):
    try:
        vk.messages.send(random_id=get_random_id(),
                         peer_id=id,
                         message=msg)
    except BaseException as ex:
        print(ex)
        return


def full_name(event):
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


def commit(state, id, buf, msg, queue):
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


def do_wait(buf, id):
    time.sleep(120)
    buf[id][1] = True
    buf[id][4] = False
    keyboard = VkKeyboard(inline=True)
    keyboard.add_button("#фиксирую", color=VkKeyboardColor.POSITIVE)
    vk.messages.send(
        peer_id=id,
        random_id=get_random_id(),
        message="Можете фиксировать.", keyboard=keyboard.get_keyboard())


def create(buf, id):
    buf[id][4] = True
    Thread(target=do_wait, args=(buf, id,)).start()
    send_message(id, "@all, Очередь запущена. Фиксировать можно через 2 минуты. Чтобы добавить себя в очередь, "
                     "напишите #фиксирую. Чтобы убрать очередь, напишите #выход. "
                     "Чтобы получить все команды очереди, введите #помощь")


def multiply_create(name, id, buf, queue):
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


def quit_qu(id, state):
    keyboard = VkKeyboard(inline=True)
    keyboard.add_button("Да", color=VkKeyboardColor.POSITIVE)
    keyboard.add_button("Нет", color=VkKeyboardColor.NEGATIVE)
    vk.messages.send(
        peer_id=id,
        random_id=get_random_id(),
        message="Вы уверены, что хотите"
                " завершить очередь?", keyboard=keyboard.get_keyboard())
    state[id].append("завершить")


def pop_timer(buf, id):
    time.sleep(5)
    buf[id][5] = False


def ifix(qu, id, queue, no_message, have_name, event):
    try:
        from_id = event.obj['message']['from_id']
        if qu.add(full_name(event), from_id):
            if not no_message:
                send_message(id, f"{full_name(event)} внесен(а) в очередь")
            if have_name:
                fixation(id, queue, qu)
        else:
            send_message(id, f"{full_name(event)} уже в очереди.")
    except BaseException as ex:
        print(ex)
        send_message(id, "Ошибка добавления в очередь")


def out(qu, id, queue, have_name, no_message, event):
    try:
        if qu.quit(full_name(event)):
            if have_name:
                fixation(id, queue, qu)
            if not no_message:
                send_message(id, f"{full_name(event)} вышел(вышла) из очереди")
        else:
            send_message(id, f"{full_name(event)} не в очереди")
    except BaseException as ex:
        print(ex)
        send_message(id, "Ошибка выхода из очереди")


def all_queue(queue, id):
    result = ""
    for num, i in enumerate(queue[id]):
        result += f"{num + 1}) {i.get_name()}\n"
    if result == "":
        send_message(id, "Очередей нет.")
    else:
        send_message(id, "Очереди:\n" + result)


def pop(id, qu, queue, pop_wait, have_name, no_message, buf):
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
            if next.get_name() != "":
                res += f"Следующий(-ая): [id{next.get_user_id()}|{next.get_name()}]"
            send_message(id, res)
            buf[id][5] = True
            Thread(target=pop_timer, args=(buf, id,)).start()
    else:
        send_message(id, "Защита двойного удаления, 5сек.")


def change(name, id, queue, buf, state, have_queue):
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


def skip(qu, id, event):
    try:
        res = qu.swap(full_name(event))
        if res == "1":
            send_message(id, "Недостаточно человек в очереди")
        elif res == "max":
            send_message(id, "Последний в очереди, некого пропускать")
        elif res == "none":
            send_message(id, f"{full_name(event)} не в очереди")
        elif res == "*":
            send_message(id, f"{full_name(event)} заморожен(а) и не может меняться местами.")
        else:
            send_message(id, f"{full_name(event)} пропустил человека вперёд")
    except BaseException as ex:
        print(ex)
        send_message(id, "Ошибка пропуска человека")


def cout(name, id, queue):
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


def goto(msg, id, state, queue, buf, have_queue):
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
