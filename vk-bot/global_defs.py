from vk_api.bot_longpoll import VkBotLongPoll, VkBotEventType
from private_api import token_api
import vk_api
from vk_api.utils import get_random_id

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


def full_name(event, user_id=0):
    try:
        bukvi = "йцукенгшщзхъфывапролджэячсмитьбюё"
        if user_id == 0:
            user_get = vk.users.get(user_ids=event.obj['message']['from_id'])
        else:
            user_get = vk.users.get(user_ids=user_id)
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
