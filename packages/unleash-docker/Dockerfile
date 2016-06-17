FROM nodesource/wheezy:6

COPY . .

RUN npm install --production
RUN mkdir scripts && cp node_modules/unleash-server/scripts/migration-runner.js scripts/. && \
    mkdir migrations && cp -r node_modules/unleash-server/migrations/* migrations/.

EXPOSE 4242

CMD node index.js
