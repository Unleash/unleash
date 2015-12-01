FROM node:4.2.2

COPY . .

RUN npm install --production && \
    npm run build

EXPOSE 4242

CMD node server.js
