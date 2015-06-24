FROM nodesource/trusty:0.12

COPY . .

RUN curl -L https://github.com/hashicorp/envconsul/releases/download/v0.5.0/envconsul_0.5.0_linux_amd64.tar.gz | \
    tar -zx -C /usr/bin/ --strip-components 1

RUN npm install --production && \
    npm run build

EXPOSE 4242

CMD envconsul -consul $(route -n | awk '/UG/ {print $2}'):8500 -prefix unleash node server.js
