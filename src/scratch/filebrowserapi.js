import axios from 'axios';
import fs from 'fs';

// Function to get the access token from the FileBrowser server
async function getToken() {
	console.log('Requesting access token...');

	try {
		const response = await axios.post('http://localhost:8081/api/login', {
			username: 'admin', // CHANGE THIS IN THE FRONTEND
			password: 'admin' // CHANGE THIS IN THE FRONTEND
		});
		console.log('Access token received.');
		return response.data;
	} catch (error) {
		console.error('Error while requesting access token:', error);
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
					'X-Auth': `${token}` // WHY NOT USE AUTH HEADER?!
				}
			}
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
			method: 'GET',
			url: url,
			responseType: 'stream',
			headers: {
				'X-Auth': `${token}`
			}
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
	}
}

async function isFileOnServer(file) {
	// adds the file meta for this client file to the server so the server knows we have the track.
	const fileOnServer = await addClientFileAndSearch(file.artist, file.title)
}

async function syncTracks(localTracks) {
	// adds the file meta for this client file to the server so the server knows we have the track.
	const syncResponse = await sync(localTracks)
	for (fileToRemove : syncResponse.filesNotOnServer) {
		if (fileToRemove in localTracks) {
			remove(localTracks[fileToRemove].path)
		}
	}
	await downloadZip(syncResponse.zipPath)
	extractZipAndMerge()
}

// users configured local root
function sync() {
	localTracks = []
	for file : local_root {
		localTracks.add({artist: file.artist, title: file.title, path: file.path})
	}
	await syncTracks(localTracks)
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