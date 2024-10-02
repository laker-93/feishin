import { useState } from 'react';
import { Text, Box, Button, Group, Checkbox } from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { useCurrentServer } from '/@/renderer/store';
import { fbController } from '/@/main/features/core/filebrowser/filebrowser-controller';
import { pymixController } from '/@/renderer/api/pymix/pymix-controller';

const upload = async (
    filePaths: File[],
    isPublic: boolean,
    isRBImport: boolean,
    isSeratoImport: boolean,
    fbToken: string,
) => {
    console.log('public?', isPublic);
    for (const file of filePaths) {
        try {
            const bufferContent = await new Response(file).arrayBuffer();
            console.log('uploading file', file.name);
            const fbUrl = 'https://browser.sub-box.net/browser';
            await fbController.upload(fbUrl, fbToken, {
                body: { fileBytes: bufferContent },
                query: { filename: file.name },
            });
            console.log('Upload successful');
        } catch (error) {
            console.error('Error uploading files:', error);
        }
    }

    if (isRBImport) {
        await pymixController.rbImport();
    } else if (isSeratoImport) {
        await pymixController.seratoImport();
    } else {
        await pymixController.beetsImport({ query: { public: true } });
    }
};

export const UploadContent = () => {
    const server = useCurrentServer();
    const [files, setFiles] = useState<File[]>([]);
    const [isPublic, setIsPublic] = useState(false);
    const [isRBImport, setIsRBImport] = useState(false);
    const [isSeratoImport, setIsSeratoImport] = useState(false);
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
        if (server.fbToken === undefined) {
            throw new Error('FB Server is not authenticated');
        }
        try {
            await upload(files, isPublic, isRBImport, isSeratoImport, server.fbToken);
        } catch (error) {
            console.error('Error syncing music directory:', error);
        }
    };

    return (
        <Box
            m={2}
            p={20}
        >
            <Text>
                Here you can upload your music collection to sub box. If you are starting from
                scratch and wish to upload your music collection from rekordbox or serato please
                follow the steps here.
            </Text>
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
                        <Checkbox
                            checked={isPublic}
                            label="Make public"
                            mt="md"
                            onChange={(event) => setIsPublic(event.currentTarget.checked)}
                        />
                        <Checkbox
                            checked={isRBImport}
                            label="Rekordbox import"
                            mt="md"
                            onChange={(event) => setIsRBImport(event.currentTarget.checked)}
                        />
                        <Checkbox
                            checked={isSeratoImport}
                            label="Serato import"
                            mt="md"
                            onChange={(event) => setIsSeratoImport(event.currentTarget.checked)}
                        />
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
