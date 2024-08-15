const fs = require('fs').promises;
const path = require('path');
const musicMetadata = require('music-metadata');
const axios = require('axios');

async function syncMusicDirectory(directoryPath) {
  try {
    const files = await fs.readdir(directoryPath);
    const musicFiles = files.filter(file => path.extname(file) === '.mp3'); // Example for mp3 files

    const clientTracks = await Promise.all(musicFiles.map(async (file) => {
      const metadata = await musicMetadata.parseFile(path.join(directoryPath, file));
      return {
        title: metadata.common.title,
        artist: metadata.common.artist,
      };
    }));

    const response = await axios.post('/sync', {
      client_tracks: clientTracks,
    });

    console.log('Sync response:', response.data);
  } catch (error) {
    console.error('Error syncing music directory:', error);
  }
}

// Example usage
syncMusicDirectory('/path/to/your/music/directory');