#!/usr/bin/env bash

npm install
npm audit fix
npm run build
docker pull redis:6.2.6-alpine
docker pull node:17-alpine3.14
docker build -t intercom .
docker-compose up -d
