const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const jsonDir = './';
const endpointUrl = 'https://cloud.awarefilter.com/v1/api/factors/patterns/';
const excludedFiles = ['default.pattern.json'];

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
// Function to send a POST request
const sendPostRequest = (url, pattern) => {
    try {
        const request = `curl -s -X POST -H 'Content-Type: application/json' -H 'Authorization: Bearer ${ACCESS_TOKEN}' -d '${pattern}' '${url}'`;
        const rawResponse = execSync(
            request,
            { encoding: 'utf-8' }
            ).trim();
            const response = JSON.parse(rawResponse.trim());
            if (!response.success) {
                console.error('Failed to distribute pattern', response.error)
            }
        return response;
    } catch (error) {
        return { error: `Error: ${error.message}`};
    }
};

const commitChange = () => {
    execSync('git add .');

    // Commit changes
    execSync('git status');
    execSync('git config user.email "actions@github.com"');
    execSync('git config user.name "GitHub Actions"');
    execSync('git commit -m "Update pattern file with ID"');

    // Push changes back to the repository
    execSync('git push');
}

const updateFileWithId = (pattern, newId, filePath) => {
    if (pattern.id || !newId) {
        // TODO Remove
        console.log(`Pattern id exists ${pattern.id}`)
        return;
    }
    try {
        console.log('id', newId)
        let newPattern = JSON.parse(pattern);
        newPattern.id = newId;
        console.log('id now', newPattern.id)
        fs.writeFileSync(filePath, JSON.stringify(newPattern));
        // TODO Remove
        commitChange(filePath);
        console.log(`Successfully updated pattern with id ${newId}`)
    } catch(error) {
        console.error(`Failed to update pattern with id`, error)
    }
}

const distributePattern = (filePath, fileName, results, executedFiles, failedFiles) => {
    console.log('Distributing pattern:', filePath)
    const pattern = fs.readFileSync(filePath, 'utf-8');
    const response = sendPostRequest(endpointUrl, pattern);
    // TODO Remove
    console.log('response', response);
    let message;
    if (response.success) {
        message = `Success for ${fileName}.json. patternId: ${response.results?.patternId}`;
        updateFileWithId(pattern, response.results?.patternId, filePath);
    } else {
        failedFiles++;
        message = `Error for ${fileName}.json. ${response.error}`;
    }
    results.push(message);
    console.log(message);
    executedFiles++;
}

const processFilesFromLatestCommit = (folderPath) => {
    // Get the list of files changed in the latest commit
    const changedFiles = fs.readFileSync(process.env.CHANGED_FILES_PATH, { encoding: 'utf-8' }).split('\n');
    let executedFiles = 0;
    let failedFiles = 0;
    const results = [];

    // Process only .json files from the latest commit
    changedFiles.forEach(file => {
        if (file.endsWith('.json')) {
            const filePath = path.join(folderPath, file);
            const fileName = file.split('.')[0];

            if (!excludedFiles.includes(fileName)) {
                distributePattern(filePath, fileName, results, executedFiles, failedFiles)
            }
        }
    });
    if (executedFiles) {
        console.log(`Finished processing ${executedFiles} JSON files.`);
        fs.writeFileSync('distributedResults.txt', results.join('\n'));
    } if (failedFiles) {
        console.error(`${failedFiles} files failed to be distributed.`);
        process.exit(1);
    } else {
        console.log('No files to process.');
    }
};

processFilesFromLatestCommit(jsonDir);