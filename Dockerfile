FROM nodesource/trusty:0.12

COPY . .

RUN curl -sL http://cldup.com/XPw5-FrHJz.gz | \
  gunzip -c | tar -x -C /tmp/ && \
  mv /tmp/envconsul_0.5.0_linux_amd64/envconsul /usr/bin/

RUN npm install --production && \
    npm run build

EXPOSE 4242

CMD envconsul -consul $(route -n | awk '/UG/ {print $2}'):8500 -prefix unleash node server.js