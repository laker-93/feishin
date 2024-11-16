import { useState, useEffect } from 'react';
import { Text, Box, Button, Group, Checkbox, Table, Progress, Select } from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { useCurrentServer } from '/@/renderer/store';
import { fbController } from '../../../api/filebrowser/filebrowser-controller';
import { pymixController } from '/@/renderer/api/pymix/pymix-controller';

const upload = async (
    filePaths: File[],
    isPublic: boolean,
    isRBImport: boolean,
    isSeratoImport: boolean,
    fbToken: string,
    updateUploadStatus: (index: number, status: string, progress: number) => void,
) => {
    console.log('public?', isPublic);
    console.log('files', filePaths);

    // Upload files
    for (const [index, file] of filePaths.entries()) {
        try {
            const fbUrl = 'https://browser.docker.localhost/browser';
            updateUploadStatus(index, 'Uploading', 0);
            await fbController.tusUpload(fbUrl, fbToken, file, (progress) => {
                updateUploadStatus(index, 'Uploading', progress);
            });
            updateUploadStatus(index, 'Processing', 100);
        } catch (error) {
            console.error('Error uploading files:', error);
            updateUploadStatus(index, 'Failed', 0);
        }
    }
    let jobId = "";
    try {
        if (isRBImport) {
            await pymixController.rbImport();
        } else if (isSeratoImport) {
            await pymixController.seratoImport();
        } else {
            jobId = await pymixController.beetsImport({ query: { public: isPublic } });
        }
    } catch (error) {
        console.error('Error during import:', error);
    }

        let percentageComplete = 0;
        let rounds = 0;
        let inProgress = true;
        while (inProgress && (Math.round(percentageComplete) < 100 || rounds < 15)) {
            try {
                const importProgress = await pymixController.beetsImportProgress({ query: { public: isPublic, jobId: jobId } });
                percentageComplete = importProgress.percentageComplete;
                inProgress = importProgress.inProgress;

                console.log('progress', importProgress);
                filePaths.forEach((_, index) => {
                    updateUploadStatus(index, 'Processing', percentageComplete);
                });
                await new Promise((resolve) => setTimeout(resolve, 5*1000)); // Poll every 5 second
            } catch (error) {
                console.error('Error fetching progress:', error);
                break;
            }
            rounds += 1;
        }
        filePaths.forEach((_, index) => {
            updateUploadStatus(index, 'Success', 100);
        });
    };

};

export const UploadContent = () => {
    const server = useCurrentServer();
    const [files, setFiles] = useState<File[]>([]);
    const [fileNames, setFileNames] = useState<string[]>(() => {
        const savedFileNames = localStorage.getItem('fileNames');
        return savedFileNames ? JSON.parse(savedFileNames) : [];
    });
    const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
    const [isPublic, setIsPublic] = useState(false);
    const [isRBImport, setIsRBImport] = useState(false);
    const [isSeratoImport, setIsSeratoImport] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<{ status: string; progress: number }[]>(() => {
        const savedStatus = localStorage.getItem('uploadStatus');
        return savedStatus ? JSON.parse(savedStatus) : [];
    });
    const [rowsToShow, setRowsToShow] = useState(20);

    useEffect(() => {
        localStorage.setItem('fileNames', JSON.stringify(fileNames));
        localStorage.setItem('uploadStatus', JSON.stringify(uploadStatus));
    }, [fileNames, uploadStatus]);

    if (!server) {
        return null;
    }
    if (server.fbToken === undefined) {
        throw new Error('FB Server is not authenticated');
    }

    const handleDrop = (acceptedFiles: File[]) => {
        setFiles([...files, ...acceptedFiles]);
        setFileNames([...fileNames, ...acceptedFiles.map(file => file.name)]);
        setUploadStatus([...uploadStatus, ...acceptedFiles.map(() => ({ status: 'Pending', progress: 0 }))]);
    };

    const handleUpload = async () => {
        if (server.fbToken === undefined) {
            throw new Error('FB Server is not authenticated');
        }
        try {
            await upload(files, isPublic, isRBImport, isSeratoImport, server.fbToken, updateUploadStatus);
        } catch (error) {
            console.error('Error syncing music directory:', error);
        }
    };

    const updateUploadStatus = (index: number, status: string, progress: number) => {
        setUploadStatus((prevStatus) => {
            const newStatus = [...prevStatus];
            newStatus[index] = { status, progress };
            return newStatus;
        });
    };

    const handleFileSelect = (index: number) => {
        setSelectedFiles((prevSelectedFiles) => {
            const newSelectedFiles = new Set(prevSelectedFiles);
            if (newSelectedFiles.has(index)) {
                newSelectedFiles.delete(index);
            } else {
                newSelectedFiles.add(index);
            }
            return newSelectedFiles;
        });
    };

    const handleRemoveSelectedFiles = () => {
        setFiles((prevFiles) => prevFiles.filter((_, index) => !selectedFiles.has(index)));
        setFileNames((prevFileNames) => prevFileNames.filter((_, index) => !selectedFiles.has(index)));
        setUploadStatus((prevStatus) => prevStatus.filter((_, index) => !selectedFiles.has(index)));
        setSelectedFiles(new Set());
    };

    return (
        <Box m={2} p={20}>
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
                                <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                    <Checkbox
                                        checked={selectedFiles.has(index)}
                                        onChange={() => handleFileSelect(index)}
                                        style={{
                                            borderRadius: '50%',
                                            marginRight: '10px',
                                        }}
                                    />
                                    {file.name}
                                </li>
                            ))}
                        </ul>
                        <Button onClick={handleRemoveSelectedFiles} mt="md">
                            Remove Selected Files
                        </Button>
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
                        <Group mt="md" position="center">
                            <Button onClick={handleUpload}>Upload</Button>
                        </Group>
                    </Box>
                )}
            </Box>
            {uploadStatus.length > 0 && (
                <Box mt={2}>
                    <Text>Upload History:</Text>
                    <Select
                        label="Rows to show"
                        value={rowsToShow.toString()}
                        onChange={(value) => setRowsToShow(Number(value))}
                        data={['10', '20', '30', '40', '50']}
                    />
                    <Box style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <Table>
                            <thead>
                                <tr>
                                    <th>File Name</th>
                                    <th>Upload Progress</th>
                                    <th>Processing Progress</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fileNames.slice(0, rowsToShow).map((fileName, index) => (
                                    <tr key={index}>
                                        <td>{fileName}</td>
                                        <td>
                                            <Progress value={uploadStatus[index]?.progress || 0} />
                                        </td>
                                        <td>
                                            {uploadStatus[index]?.status === 'Processing' && (
                                                <Progress value={uploadStatus[index]?.progress || 0} />
                                            )}
                                        </td>
                                        <td>{uploadStatus[index]?.status || 'Pending'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Box>
                </Box>
            )}
        </Box>
    );
};