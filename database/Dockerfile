FROM mongo:latest
COPY mongo.yaml /etc/mongo/mongo.conf
EXPOSE 27017
CMD ["mongod", "--config", "/etc/mongo/mongo.conf", "--replSet", "rs0", "--bind_ip", "localhost,mongo1"]