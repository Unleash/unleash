FROM node:5.8

COPY . .

RUN npm install --production && \
    mkdir migrations && cp -r node_modules/unleash-server/migrations/* migrations/.

EXPOSE 4242

CMD node index.js
