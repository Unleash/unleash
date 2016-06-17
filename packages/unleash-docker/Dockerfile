FROM node:5.8

COPY . .

RUN npm install --production && \
    cp node_modules/unleash-server/scripts/migration-runner.js scripts/. && \
    mkdir migrations && cp -r node_modules/unleash-server/migrations/* migrations/.

EXPOSE 4242

CMD node index.js
