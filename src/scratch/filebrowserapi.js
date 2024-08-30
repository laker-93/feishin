import fs from 'fs';
import axios from 'axios';

// Function to get the access token from the FileBrowser server
async function getToken() {
    console.log('Requesting access token...');

    try {
        const response = await axios.post('http://localhost:8081/api/login', {
            // CHANGE THIS IN THE FRONTEND
            password: 'admin',
            username: 'admin', // CHANGE THIS IN THE FRONTEND
        });
        console.log('Access token received.');
        return response.data;
    } catch (error) {
        console.error('Error while requesting access token:', error);
        return null;
    }
}

// Function to upload a text file to the FileBrowser server
async function uploadFile(token) {
    console.log('Uploading file...');

    // Read the file into a string
    const fileContents = fs.readFileSync('test.txt', 'utf8');

    try {
        // Send a POST request to the FileBrowser server
        const res = await axios.post(
            'http://localhost:8081/api/resources/document.txt?override=true',
            fileContents,
            {
                headers: {
                    'Content-Type': 'text/plain', // ADJUST THIS PER FILETYPE (img, pdf, etc)
                    'X-Auth': `${token}`, // WHY NOT USE AUTH HEADER?!
                },
            },
        );

        console.log('File uploaded successfully:', res.data);
    } catch (error) {
        console.error('Error while uploading file:', error);
    }
}

// Function to download a text file from the FileBrowser server
async function downloadFile(token) {
    console.log('Downloading file...');

    const url = 'http://localhost:8081/api/raw/document.txt'; // WHY USE DIFFERENT ENDPOINTS TO UPLOAD AND DOWNLOAD? (resources vs raw)

    try {
        const response = await axios({
            headers: {
                'X-Auth': `${token}`,
            },
            method: 'GET',
            responseType: 'stream',
            url,
        });

        const writer = fs.createWriteStream('DownloadedTextFile.txt');

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log('File downloaded successfully.');
                resolve();
            });
            writer.on('error', (error) => {
                console.error('Error while downloading file:', error);
                reject(error);
            });
        });
    } catch (error) {
        console.error('Error while requesting file download:', error);
        return null;
    }
}

// Main function to control the flow of the program
async function main() {
    const token = await getToken();

    if (token) {
        await uploadFile(token);
        await downloadFile(token);
    } else {
        console.log('No access token received. Aborting.');
    }
}

// Catch any unhandled Promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the program
main();
