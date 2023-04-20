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

os.system(f"docker run --rm -p{port}:27017 -v {dataDir}:/data/db mongo")