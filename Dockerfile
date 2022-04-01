FROM node:17-alpine3.14

WORKDIR '/app'

COPY /dist/index.js /app
EXPOSE 3002

CMD ["node", "index.js"]