FROM node:lts-slim
WORKDIR /server
ADD ./src /server
ADD ./package.json /server
RUN npm install --omit=dev
EXPOSE 8000