import string

import pymongo
from pymongo import MongoClient
from global_defs import full_name


class UserManager:
    def __init__(self, collection_users: pymongo.collection.Collection) -> object:
        self.collection_users = collection_users

    def get_user(self, vk_id):
        find = self.collection_users.find_one({"vk":vk_id})
        if find is not None:
            return {"type": "SITE", "login": find.login, "username": find.username}
        else:
            return {"type": "VK", "login": vk_id, "username": full_name(None, vk_id)}

