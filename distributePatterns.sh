#!/bin/bash

json_dir="./"
endpoint_url="http://localhost:8080/api/v1/factors/patterns/"
excluded_files=("default.pattern.json")

# Loop through all JSON files in the directory and subdirectories
find "$json_dir" -type f -name "*.json" -print0 | while IFS= read -r -d '' json_file; do
    # Check if the file is in the excluded list
    if [[ " ${excluded_files[@]} " =~ " $(basename "$json_file") " ]]; then
        echo "Excluded file: $json_file"
    else
        # Read the JSON payload from the file
        json_payload=$(cat "$json_file")

        # Send the POST request
        response=$(curl -s -X POST -H "Content-Type: application/json" -d "$json_payload" "$endpoint_url")

        # Handle the response
        echo "Response for $json_file: $response"
    fi
done
