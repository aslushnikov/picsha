#!/bin/bash
while true
do
    git pull origin master
    npm install .
    sleep 300
done
