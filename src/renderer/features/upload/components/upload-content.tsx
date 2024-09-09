import { useState } from 'react';
import { Text, Box, Button, Group } from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { useCurrentServer } from '/@/renderer/store';
import isElectron from 'is-electron';
import { fbController } from '/@/main/features/core/filebrowser/filebrowser-controller';

const userFS = isElectron() ? window.electron.userFs : null;

const upload = async (filePaths: File[], fbToken: string) => {
    for (const file of filePaths) {
        try {
            const bufferContent = await new Response(file).arrayBuffer();

            const fbUrl = 'https://browser.sub-box.net/browser';
            await fbController.upload(fbUrl, fbToken, {
                body: { fileBytes: bufferContent },
                query: { filename: 'new-song.mp3' },
            });

            console.log('Upload successful');
        } catch (error) {
            console.error('Error uploading files:', error);
        }
    }
};

export const UploadContent = () => {
    const server = useCurrentServer();
    const [files, setFiles] = useState<File[]>([]);
    if (!server) {
        return null;
    }
    if (server.fbToken === undefined) {
        throw new Error('FB Server is not authenticated');
    }

    const handleDrop = (acceptedFiles: File[]) => {
        setFiles([...files, ...acceptedFiles]);
    };

    const handleUpload = async () => {
        if (userFS) {
            if (server.fbToken === undefined) {
                throw new Error('FB Server is not authenticated');
            }
            files.forEach((file) => {
                console.log('file path', file.path);
            });

            try {
                console.log('uploading files');
                await upload(files, server.fbToken);
            } catch (error) {
                console.error('Error syncing music directory:', error);
            }
        }
    };

    return (
        <Box
            m={2}
            p={20}
        >
            <Text>Upload. </Text>
            <Dropzone
                multiple
                accept={[MIME_TYPES.mp3, MIME_TYPES.wav, MIME_TYPES.ogg, MIME_TYPES.flac]}
                style={{
                    border: '2px dashed #cccccc',
                    cursor: 'pointer',
                    padding: '20px',
                    textAlign: 'center',
                }}
                onDrop={handleDrop}
            >
                <Text>Drag and drop audio files here, or click to select files</Text>
            </Dropzone>
            <Box mt={2}>
                {files.length > 0 && (
                    <Box>
                        <Text>Files to be uploaded:</Text>
                        <ul>
                            {files.map((file, index) => (
                                <li key={index}>{file.name}</li>
                            ))}
                        </ul>
                        <Group
                            mt="md"
                            position="center"
                        >
                            <Button onClick={handleUpload}>Upload</Button>
                        </Group>
                    </Box>
                )}
            </Box>
        </Box>
    );
};
