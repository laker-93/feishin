import fs from 'fs';
import axios from 'axios';
import tus from 'tus-js-client';

// const url = 'https://browser.sub-box.net/browser'
const url = 'https://browser.docker.localhost/browser';
// Function to get the access token from the FileBrowser server
async function getToken() {
    console.log('Requesting access token...');

    try {
        const response = await axios.post(`${url}/api/login`, {
            // CHANGE THIS IN THE FRONTEND
            password: 'test311024',
            username: 'test311024', // CHANGE THIS IN THE FRONTEND
        });
        console.log('Access token received.');
        return response.data;
    } catch (error) {
        console.error('Error while requesting access token:', error);
        return null;
    }
}

// Function to upload a file to the FileBrowser server using TUS
async function uploadFile(token) {
    console.log('Uploading file using TUS...');

    const fileName = 'test1.zip';
    const filePath = `/Users/lukepurnell/Documents/${fileName}`;
    const resourcePath = `${url}/api/tus/uploads/${fileName}?override=true`;
    // const file = fs.createReadStream(filePath);
    // const fileSize = fs.statSync(filePath).size;
    // const arrayBuffer = await new Response(filePath).arrayBuffer();
    // const buf = await new Response(filePath).Buffer;
    // const buf = Buffer.from(new Uint8Array(arrayBuffer));

    const resp = await fetch(resourcePath, {
        headers: {
            'X-Auth': `${token}`,
        },
        method: 'POST',
    });
    if (resp.status !== 201) {
        throw new Error(`Failed to create an upload: ${resp.status} ${resp.statusText}`);
    }
    return new Promise((resolve, reject) => {
        const upload = new tus.Upload(filePath, {
            chunkSize: 10485760 * 2,

            // endpoint: resourcePath,
            headers: {
                'X-Auth': `${token}`,
            },
            // uploadSize: fileSize,
            onError: (error) => {
                console.error('Error while uploading file:', error);
                reject(error);
            },

            onProgress: (bytesUploaded, bytesTotal) => {
                const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
                console.log(`Uploaded ${bytesUploaded} of ${bytesTotal} bytes (${percentage}%)`);
            },
            onSuccess: () => {
                console.log('File uploaded successfully.');
                resolve(upload.url);
            },
            uploadUrl: resourcePath,
        });

        upload.start();
    });
}

// Function to download a text file from the FileBrowser server
async function downloadFile(token) {
    console.log('Downloading file...');

    // const url = `${url}/api/raw/document.txt`; // WHY USE DIFFERENT ENDPOINTS TO UPLOAD AND DOWNLOAD? (resources vs raw)

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
