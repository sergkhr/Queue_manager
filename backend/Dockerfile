FROM node:lts-slim
WORKDIR /server
ADD ./package.json /server/
RUN npm install --omit=dev
EXPOSE 8000
CMD [ "node", "src/index.js" ]