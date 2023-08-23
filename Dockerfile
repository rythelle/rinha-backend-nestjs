FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm i --silent

COPY . .

RUN npm run build

CMD ["npm", "run", "start:prod"]