#!/bin/bash
# the #! thing must be on the first line of a shell file
# REFERENCE: https://stackoverflow.com/questions/78500319/how-to-pull-model-automatically-with-container-creation

# Record Process ID.
pid=$!

sleep 5

echo "Wait for model..."
sleep 3m
echo "Done"

node index.js

wait $pid