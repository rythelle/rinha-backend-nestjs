FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i --silent

COPY . .

RUN npm run build

CMD ["npm", "run", "start:prod"]