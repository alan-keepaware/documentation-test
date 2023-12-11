const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const jsonDir = './';
const endpointUrl = 'https://cloud.awarefilter.com/v1/api/factors/patterns/';
const excludedFiles = ['default.pattern.json'];

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
// Function to send a POST request
const sendPostRequest = (url, payload) => {
    try {
        const request = `curl -s -X POST -H 'Content-Type: application/json' -H 'Authorization: Bearer ${ACCESS_TOKEN}' -d '${payload}' '${url}'`;
        const rawResponse = execSync(
            request,
            { encoding: 'utf-8' }
            ).trim();
            const response = JSON.parse(rawResponse.trim());
            if (!response.success) {
                throw new Error('Failed to distribute pattern', response.error);
            }
        return response;
    } catch (error) {
        return `Error: ${error.message}`;
    }
};

const processFilesFromLatestCommit = (folderPath) => {
    // Get the list of files changed in the latest commit
    const changedFiles = fs.readFileSync(process.env.CHANGED_FILES_PATH, { encoding: 'utf-8' }).split('\n');
    let executedFiles = 0;
    const results = [];

    // Process only .json files from the latest commit
    changedFiles.forEach(file => {
        if (file.endsWith('.json')) {
            const filePath = path.join(folderPath, file);
            const fileName = file.split('.')[0];

            if (!excludedFiles.includes(fileName)) {
                console.log('Distributing pattern:', filePath)
                const jsonPayload = fs.readFileSync(filePath, 'utf-8');
                const response = sendPostRequest(endpointUrl, jsonPayload);
                let message;
                if (response.success) {
                    message = `Success for ${fileName}.json: ${response}`;
                } else {
                    message = `Error for ${fileName}.json: ${response.error}`;
                }
                results.push(message);
                console.log(message);
                executedFiles++;
            }
        }
    });
    if (executedFiles) {
        console.log(`Finished processing ${executedFiles} JSON files.`);
        fs.writeFileSync('distributedResults.txt', results.join('\n'));
    } else {
        console.log('No files to process.');
    }
};

processFilesFromLatestCommit(jsonDir);