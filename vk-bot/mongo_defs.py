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
                    "напишите #фиксирую. Чтобы убрать очередь, напишите #выход. "
                    "Чтобы получить все команды очереди, введите #помощь", keyboard=keyboard.get_keyboard())
    else:
        state[id][4] = True
        Thread(target=do_wait, args=(state, id, minutes,)).start()
        send_message(id,
                     f"@all, Очередь запущена. Фиксировать можно через {minutes} минут. Чтобы добавить себя в очередь, "
                     "напишите #фиксирую. Чтобы убрать очередь, напишите #выход. "
                     "Чтобы получить все команды очереди, введите #помощь")


def do_wait(buf, id, event, minutes):
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
