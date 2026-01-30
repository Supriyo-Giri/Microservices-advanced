#use official node.js 20 as the base image
FROM node:20

WORKDIR /use/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3003

CMD ["node","src/server.js"]


