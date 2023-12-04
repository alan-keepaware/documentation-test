const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const jsonDir = './';
const endpointUrl = 'https://cloud.awarefilter.com/api/v1/factors/patterns/';
const excludedFiles = ['default.pattern.json'];

const CONSOLE_API_KEY = process.env.CONSOLE_API_KEY;

const key = 'eyJraWQiOiJUVjJna0phVVJcL2VGaUkyRjBaWDdaVktKWnVBQXM5aXBhOUlKODJvV3ZcLzg9IiwiYWxnIjoiUlMyNTYifQ.eyJhdF9oYXNoIjoiV3Zsa3o1S1B6YXgyUWFxbmpzaVdnUSIsInN1YiI6IjgwNmNkM2MzLTlkM2EtNDE5Yy1hZjZjLWNiODA4MDI0NzgyOSIsImNvZ25pdG86Z3JvdXBzIjpbInVzLXdlc3QtMl9hOUZVZnR4MVdfR29vZ2xlIl0sImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtd2VzdC0yLmFtYXpvbmF3cy5jb21cL3VzLXdlc3QtMl9hOUZVZnR4MVciLCJjb2duaXRvOnVzZXJuYW1lIjoiZ29vZ2xlXzExMzEzNTYzNjkxNDY0NDQ2OTIzNCIsIm9yaWdpbl9qdGkiOiJmYWNmNWZhMy1kNzg4LTRmYWYtYTY4Yi0wZDhiYTE0MDQ0OGMiLCJhdWQiOiI0djNoaDdjMWFpOTRvNWYwdnRhM2ZidDRpYSIsImlkZW50aXRpZXMiOlt7InVzZXJJZCI6IjExMzEzNTYzNjkxNDY0NDQ2OTIzNCIsInByb3ZpZGVyTmFtZSI6Ikdvb2dsZSIsInByb3ZpZGVyVHlwZSI6Ikdvb2dsZSIsImlzc3VlciI6bnVsbCwicHJpbWFyeSI6InRydWUiLCJkYXRlQ3JlYXRlZCI6IjE2OTY4ODkyODE3MjQifV0sInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzAxMjY5ODExLCJleHAiOjE3MDE2NDUwNDcsImlhdCI6MTcwMTY0MTQ0NywianRpIjoiMWFmNDdmMGEtMTQ0NC00ZjJmLTk4ZDUtNTAzN2E0ODc0MWQ1IiwiZW1haWwiOiJhbGFuQGtlZXBhd2FyZS5jbyJ9.e0pbGpDz22Hxr-kz2uMYPJxmBl2xtSPKIiYi96-gQJXVjLiuRZGkpMl16hXTxYz3_ili2kF9TMdDuRKGxdntlKH6ioixqlToK6wy7p7ivP6i-KACHfqiTPUbpXmyfPUaYaFaG06_ujLj_S5B_-3XDh8G_dQZuQEsz4vfGMylrt2pU-7dDDHJtwk6Yk7nG2tOLvhGfB0D7gw_AwNc4_TMILzjzgfvEetY5JdekaBGgdbdwChghSLt-JpfwZhmN3IFZFYPLUuEELfJwBJDBK0yN1FvDR_tZvMRZYC9QCRfUG9dfDVIQopCDW1-ogXJC49qyiW5ARwczCGSoHrsMPHELQ';

// Function to send a POST request
const sendPostRequest = (url, payload) => {
    try {
        const request = `curl -s -X POST -H "Content-Type: application/json" -H "Authorization: ${CONSOLE_API_KEY}" -d '${payload}' '${url}'`;
        const response = execSync(
            request,
            { encoding: 'utf-8' }
            );
            console.log(request)
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