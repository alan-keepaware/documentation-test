const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const jsonDir = './';
const endpointUrl = 'http://localhost:8080/api/v1/factors/patterns/';
const excludedFiles = ['default.pattern.json'];

// Function to send a POST request 
const sendPostRequest = (url, payload) => {
    try {
        const response = execSync(`curl -s -X GET google.com`, { encoding: 'utf-8' });
        return response.trim();
    } catch (error) {
        return `Error: ${error.message}`;
    }
};

// Loop through all JSON files in the directory and subdirectories
const processFiles = (folderPath) => {
    fs.readdirSync(folderPath).forEach(file => {
        const filePath = path.join(folderPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            processFiles(filePath);
        } else if (file.endsWith('.json')) {
            const fileName = file.split('.')[0];
            if (!excludedFiles.includes(fileName)) {
                const jsonPayload = fs.readFileSync(filePath, 'utf-8');
                const response = sendPostRequest(endpointUrl, jsonPayload);
                console.log(`Response for ${fileName}.json: ${response}`);
            }
        }
    });
};

processFiles(jsonDir);
console.log('Finished processing JSON files!');