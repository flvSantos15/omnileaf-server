#!/bin/bash

if [[ "$NODE_ENV" == "development" ]];
then
    node ace migration:run
    node ace serve -w
else
    node ace migration:run
    node ace build --production
    yarn --cwd ./build install --production
    cp .env ./build/.env
    node ./build/server.js
fi
 