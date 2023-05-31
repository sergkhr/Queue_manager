import json
import os

port = 27017
dataDir = "%cd%/data"
with open("config.json") as file:
    config = json.load(file)
    if "port" in config:
        port = config["port"]
    if "dataDir" in config:
        dataDir = config["dataDir"]

os.system(f"docker run -d --rm --name mongo1 -p{port}:27017 --network my-mongo -v {dataDir}:/data/db mymongo")