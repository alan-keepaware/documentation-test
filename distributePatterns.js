const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const jsonDir = './';
const endpointUrl = 'https://cloud.awarefilter.com/v1/api/factors/patterns/';
const excludedFiles = ['default.pattern.json'];

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
// Function to send a POST request
const sendPostRequest = async (url, payload) => {
    try {
        const request = `curl -s -X POST -H 'Content-Type: application/json' -H 'Authorization: Bearer ${ACCESS_TOKEN}' -d '${payload}' '${url}'`;
        const response = await execSync(
            request,
            { encoding: 'utf-8' }
            ).trim();
            console.log('response', response)
            console.log('success', response.success)
        if (!response.success) {
            console.error('Failed to distribute pattern', response.error);
        }
        return response;
    } catch (error) {
        return `Error: ${error.message}`;
    }
};

const processFilesFromLatestCommit = async (folderPath) => {
    // Get the list of files changed in the latest commit
    const changedFiles = fs.readFileSync(process.env.CHANGED_FILES_PATH, { encoding: 'utf-8' }).split('\n');
    let executedFiles = 0;

    // Process only .json files from the latest commit
    changedFiles.forEach(async file => {
        if (file.endsWith('.json')) {
            const filePath = path.join(folderPath, file);
            const fileName = file.split('.')[0];

            if (!excludedFiles.includes(fileName)) {
                console.log('Distributing pattern:', filePath)
                const jsonPayload = fs.readFileSync(filePath, 'utf-8');
                const response = await sendPostRequest(endpointUrl, jsonPayload);
                console.log(`Response for ${fileName}.json: ${response}`);
                executedFiles++;
            }
        }
    });
    if (executedFiles) {
        console.log(`Finished processing ${executedFiles} JSON files!`);
    } else {
        console.log('No files to process.');
    }
};

processFilesFromLatestCommit(jsonDir);