import pickle
import os
import copy
# from classes import *
from Queue import Queue
from vk_api.utils import get_random_id
from threading import Thread
from vk_api.keyboard import VkKeyboard, VkKeyboardColor
import time
from UserManager import UserManager
from pymongo import MongoClient
from global_defs import vk, vk_session, send_message, full_name, longpoll

client = MongoClient(f"mongodb://" + "127.0.0.1" + ":" + "27017" + f"/?replicaSet=qm_rs&directConnection=true")

db = client['queue_manager_db']
collection_users = db["Users"]
collection_queues = db['Queues']
userManager = UserManager(collection_users)
with open("counter.txt", "r") as f:
    counter = int(f.read())
default_name = "defaultQueueName"

result = collection_queues.find_one()


def setup_listener(condition):
    change_stream = collection_queues.watch()
    for change in change_stream:
        print("Changed base")
        print(change)
        for key, i in zip(condition.keys(), condition.values()):
            try:
                if change["documentKey"]["_id"] == i[0]._id:
                    buf:Queue = i[0]
                    i[0] = Queue.from_map(collection_queues.find_one(change["documentKey"]["_id"]))
            except AttributeError:
                print("Queue is creating now")


def create_queue(state, id, event, minutes=0):
    state[id][1] = True
    user_id = vk.users.get(user_ids=event.obj['message']['from_id'])[0]["id"]
    global counter
    queue_name = default_name + str(counter)
    counter += 1
    with open("counter.txt", "w") as f:
        f.write(str(counter))
    buf = Queue(id, userManager.get_user(user_id), name=queue_name, delay=minutes)
    collection_queues.insert_one(buf.to_json())
    state[id][0] = Queue.from_map(collection_queues.find_one({"name": queue_name, "vkConfs": {"$elemMatch": {"$eq": id}}}))
    if minutes == 0:
        keyboard = VkKeyboard(inline=True)
        keyboard.add_button("#фиксирую", color=VkKeyboardColor.POSITIVE)
        vk.messages.send(
            peer_id=id,
            random_id=get_random_id(),
            message="@all, Очередь запущена. Можете фиксировать. "
                    "Чтобы добавить себя в очередь, "
                    "напишите #фиксирую. Чтобы убрать очередь, напишите #закрыть. "
                    "Чтобы получить все команды очереди, введите #помощь", keyboard=keyboard.get_keyboard())
    else:

        state[id][4] = True
        Thread(target=do_wait, args=(state, id, minutes,)).start()
        last_number = str(minutes)[-1]
        if last_number == "1":
            word = "минуту"
        elif last_number == "2" or last_number == "3" or last_number == "4":
            word = "минуты"
        else:
            word = "минут"
        send_message(id,
                     f"@all, Очередь запущена. Фиксировать можно через {minutes} {word}. Чтобы добавить себя в очередь, "
                     "напишите #фиксирую."
                     "Чтобы получить все команды очереди, введите #помощь")


def do_wait(buf, id, minutes):
    time.sleep(minutes * 60)
    buf[id][1] = True
    buf[id][4] = False
    keyboard = VkKeyboard(inline=True)
    keyboard.add_button("#фиксирую", color=VkKeyboardColor.POSITIVE)
    vk.messages.send(
        peer_id=id,
        random_id=get_random_id(),
        message="Можете фиксировать.", keyboard=keyboard.get_keyboard())


def open_queue_name(name, id, buf):
    flag = False
    qu = collection_queues.find_one({"name": name, "vkConfs": {"$elemMatch": {"$eq": id}}})
    if qu is not None:
        flag = True
        buf[id][0] = Queue.from_map(qu)
        buf[id][1] = True
        buf[id][2] = True
        send_message(id, f"Очередь {name} была запущена.")
    if not flag:
        send_message(id, "Очередь не найдена.")


def quit_queue(id, state):
    keyboard = VkKeyboard(inline=True)
    keyboard.add_button("Да", color=VkKeyboardColor.POSITIVE)
    keyboard.add_button("Нет", color=VkKeyboardColor.NEGATIVE)
    vk.messages.send(
        peer_id=id,
        random_id=get_random_id(),
        message="Вы уверены, что хотите"
                " завершить очередь?", keyboard=keyboard.get_keyboard())
    state[id].append("завершить")


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
            buf[id][0] = None
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

def set_queue_name(queue, name):
    collection_queues.update_one({"_id":queue._id}, {"$set": {"name":name}})
    queue.set_name(name)


def set_queue_description(queue, description):
    collection_queues.update_one({"_id": queue._id}, {"$set": {"description": description}})
    queue.set_description(description)



def add_fix(qu, id, no_message, event):
    try:
        from_id = event.obj['message']['from_id']
        user = userManager.get_user(from_id)
        user["frozen"] = False

        if not qu.is_user_in_queue(user):
            collection_queues.update_one({"_id":qu._id}, {"$push": {"queuedPeople": user}})
            if not no_message:
                send_message(id, f"{full_name(event)} внесен(а) в очередь")
        else:
            send_message(id, f"{full_name(event)} уже в очереди.")
    except BaseException as ex:
        print(ex)
        send_message(id, "Ошибка добавления в очередь")


def all_queue(id):
    queues = collection_queues.find({"vkConfs": {"$elemMatch": {"$eq": id}}})
    if queues is None:
        send_message(id, "Очередей нет.")
    else:
        result = "Очереди:\n"
        for num, queue in enumerate(queues):
            result += f"{num+1}) " + queue["name"] + "\n"
        send_message(id, result)


def goto(msg, id, condition, have_queue):
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
        queues = collection_queues.find({"vkConfs": {"$elemMatch": {"$eq": id}}})
        if num < 1:
            send_message(id, "Очереди по этому порядковому номеру не существует.")
        else:
            flag = False
            try:
                condition[id][0] = Queue.from_map(queues[num - 1])
            except Exception:
                send_message(id, "Очереди по этому порядковому номеру не существует.")
                flag = True
            if not flag:
                condition[id][1] = True
                if not have_queue:
                    send_message(id, "Очередь была сменена")
                else:
                    send_message(id, "Очередь была запущена.")


def pop_timer(buf, id):
    time.sleep(5)
    buf[id][5] = False


def out(id, qu, no_message, event):
    user_id = vk.users.get(user_ids=event.obj['message']['from_id'])[0]["id"]
    res = collection_queues.update_one({"_id": qu._id}, {"$pull": {"queuedPeople": {"login": user_id}}})
    #buf = Queue.from_map(collection_queues.find_one({"_id": qu._id}))
    if res.modified_count == 1:
        if not no_message:
            send_message(id, f"{full_name(event)} вышел(вышла) из очереди.")
    else:
        send_message(id, f"{full_name(event)} не в очереди")


def pop(id, qu, pop_wait, no_message, condition, event):
    if not pop_wait:
        deleted = qu.pop()
        if deleted == "-":
            send_message(id, f"Некого удалять.")
        #res = collection_queues.update_one({"_id": qu._id}, {"$pop": {"queuedPeople": -1}})
        res = collection_queues.update_one({"_id": qu._id}, {"$pull": {"queuedPeople": {"login": deleted}}})
        if res.modified_count == 1:
            res = ""
            if not no_message:
                res += f"{qu.get_first()} был(а) удален(а) из очереди.\n"
            next = qu.get_next()
            if next != "":
                res += f"Следующий(-ая) в очереди: {next}"
            if res != "":
                send_message(id, res)
        condition[id][5] = True
        Thread(target=pop_timer, args=(condition, id,)).start()
    else:
        send_message(id, "Защита двойного удаления, 5сек.")

def freeze(id, qu, event, freeze=False):
    user_id = vk.users.get(user_ids=event.obj['message']['from_id'])[0]["id"]
    user = userManager.get_user(user_id)
    if not freeze:
        user["frozen"] = True
    else:
        user["frozen"] = False
    res = collection_queues.update_one({"_id": qu._id, "queuedPeople": {"$elemMatch": {"login": user_id}}}, {"$set":{"queuedPeople.$":user}})
    if res.modified_count == 1:
        if not freeze:
            send_message(id, f"{full_name(event)} был(а) заморожен(а)")
        else:
            send_message(id, f"{full_name(event)} был(а) разморожен(а)")
    else:
        send_message(id, "Человек не найден.")

