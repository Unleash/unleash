FROM node:5.8

COPY . .

RUN npm install --production && \
    npm run build

EXPOSE 4242

CMD node server.js
