#!/bin/bash

# Start the main app
npm start & 

# Start the file upload service
npm run file-upload-server &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?