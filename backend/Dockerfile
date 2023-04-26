FROM node:lts-slim
WORKDIR /server
ADD ./package.json /server/
RUN npm install --omit=dev
ADD ./dist /server/src
ADD ./config.json /server/
EXPOSE 8000
CMD [ "node", "src/index.js" ]