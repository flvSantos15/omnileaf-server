#!/bin/bash

if [[ "$NODE_ENV" == "development" ]];
then
    node ace serve -w
else
    node ace build --production
    yarn --cwd ./build install --production
    cp .env ./build/.env
    node ./build/server.js
fi
 