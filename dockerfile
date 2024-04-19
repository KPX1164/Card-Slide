FROM node:16.14.2-alpine

WORKDIR /

COPY package.json .
RUN npm i 
COPY . ./
ENV PORT 3000 
EXPOSE $PORT

CMD [ "npm","run", "start" ]