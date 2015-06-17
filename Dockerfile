FROM mhart/alpine-node:0.10.38

COPY . .

RUN npm install --production && \
    npm run build

EXPOSE 4242
ENTRYPOINT ["npm"]

CMD ["start"]
