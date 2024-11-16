import fs from 'fs';
import https from 'https';
import axios from 'axios';
import sslRootCAs from 'ssl-root-cas';
// sslRootCAs.inject()
// .addFile(__dirname + '/comodohigh-assurancesecureserverca.crt');

async function syncMusicDirectory(directoryPath) {
    const url = 'https://pymix.docker.localhost/pymix/sync';
    // const url = 'https://pymix.docker.localhost/pymix/healthcheck'
    console.log('url:', url);
    const body = { tracks: [{ artist: 'artist', title: 'title' }] };
    const resp = await axios.post(url, body, {
        httpsAgent: new https.Agent({
            rejectUnauthorized: false,
        }),
    });
    // const httpsAgent = new https.Agent({
    //    rejectUnauthorized: false, // (NOTE: this will disable client verification)
    //    cert: fs.readFileSync("/Users/lukepurnell/workspace/traefik/certs/local-cert.pem"),
    //    key: fs.readFileSync("/Users/lukepurnell/workspace/traefik/certs/local-key.pem"),
    //  })
    //
    // const resp = await axios.post(url, { httpsAgent })
    // const resp = await axios.get(url, { httpsAgent })
    console.log('resp:', resp);
    // try {
    //    const files = await fs.readdir(directoryPath);
    //    const musicFiles = files.filter((file) => path.extname(file) === '.mp3'); // Example for mp3 files

    //    const clientTracks = await Promise.all(
    //        musicFiles.map(async (file) => {
    //            const metadata = await musicMetadata.parseFile(path.join(directoryPath, file));
    //            return {
    //                artist: metadata.common.artist,
    //                title: metadata.common.title,
    //            };
    //        }),
    //    );

    //    const response = await axios.post('/sync', {
    //        client_tracks: clientTracks,
    //    });

    //    console.log('Sync response:', response.data);
    // } catch (error) {
    //    console.error('Error syncing music directory:', error);
    // }
}

// Example usage
syncMusicDirectory('/path/to/your/music/directory');
