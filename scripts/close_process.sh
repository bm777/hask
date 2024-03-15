#!/bin/bash

# process names to kill
process_names=("ollama") # only ollama for the moment

for name in "${process_names[@]}"; do
    process_id=$(pgrep -f "$name")

    # Check if the process ID was found # doesn't work in windows OS
    if [ -n "$process_id" ]; then
        echo "Terminating process $name with PID: $process_id"
        kill -9 "$process_id"
    else
        echo "Process $name not found"
    fi
done


echo "All processes killed." # lol only for Linux and Mac OS
