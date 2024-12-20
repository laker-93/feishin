import { useState, useEffect } from 'react';
import {
    Text,
    Image,
    Box,
    Button,
    Group,
    Checkbox,
    Table,
    Progress,
    Select,
    Divider,
    Collapse,
    List,
    Modal,
} from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { useCurrentServer } from '/@/renderer/store';
import { pymixController } from '/@/renderer/api/pymix/pymix-controller';
import { v4 as uuidv4 } from 'uuid';
import RBBackup from '../../../../../assets/RB-backup.png';
import { fbController } from '../../../api/filebrowser/filebrowser-controller';

type UploadHistoryEntry = {
    createdTime: string;
    fileName: string;
    id: string;
    processProgress: number;
    status: string;
    updatedTime: string;
    uploadProgress: number;
};

const delay = (ms: number) =>
    new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
    });

const upload = async (
    filePaths: { file: File; id: string }[],
    isPublic: boolean,
    fbToken: string,
    updateUploadStatus: (
        id: string,
        status: string,
        uploadProgress: number,
        processProgress: number,
    ) => void,
) => {
    console.log('public?', isPublic);
    console.log('files', filePaths);

    // Upload files
    for (const { id, file } of filePaths) {
        try {
            const fbUrl = 'https://browser.docker.localhost/browser';
            updateUploadStatus(id, 'Uploading', 0, 0);
            await fbController.tusUpload(fbUrl, fbToken, file, (progress) => {
                updateUploadStatus(id, 'Uploading', progress, 0);
            });
            updateUploadStatus(id, 'Uploaded', 100, 0);
        } catch (error) {
            console.error('Error uploading files:', error);
            updateUploadStatus(id, 'Upload Failed', 0, 0);
        }
    }
};

const processImport = async (
    isPublic: boolean,
    isRBImport: boolean,
    isSeratoImport: boolean,
    updateUploadStatus: (
        id: string,
        status: string,
        uploadProgress: number,
        processProgress: number,
    ) => void,
) => {
    let jobId = '';
    try {
        if (isRBImport) {
            jobId = await pymixController.rbImport();
        } else if (isSeratoImport) {
            await pymixController.seratoImport();
        } else {
            jobId = await pymixController.beetsImport({ query: { public: isPublic } });
        }
    } catch (error) {
        console.error('Error during import:', error);
    }

    if (!jobId) {
        return;
    }

    let percentageComplete = 0;
    let rounds = 0;
    let inProgress = true;
    let result = false;
    const processedFiles = [];

    const savedHistory = localStorage.getItem('uploadHistory');
    const uploadHistory: UploadHistoryEntry[] = savedHistory ? JSON.parse(savedHistory) : [];
    while (inProgress) {
        try {
            const importProgress = await pymixController.beetsImportProgress({
                query: { jobId, public: isPublic },
            });
            percentageComplete = importProgress.percentageComplete;
            inProgress = importProgress.inProgress;
            result = importProgress.result;
            console.log(
                `progress ${percentageComplete} in progress ${inProgress} result ${result} on round ${rounds}`,
            );

            // Get entries by id from uploadHistory and filter out anything with status not equal to 'Uploaded' or 'Processing'
            const filteredFileIds = uploadHistory.filter(
                (entry) => entry && (entry.status === 'Uploaded' || entry.status === 'Processing'),
            );

            for (let i = 0; i < filteredFileIds.length; i += 1) {
                const { id } = filteredFileIds[i];
                updateUploadStatus(id, 'Processing', 100, percentageComplete);
                processedFiles.push({ id });
            }

            await delay(2000); // Poll every 2 seconds
        } catch (error) {
            console.error('Error fetching progress:', error);
            break;
        }
        rounds += 1;
    }
    const outcome = result ? 'Success' : 'Processing Failed';
    processedFiles.forEach(({ id }) => {
        updateUploadStatus(id, outcome, 100, 100);
    });
};

export const UploadContent = () => {
    const server = useCurrentServer();
    const [files, setFiles] = useState<File[]>([]);
    const [selectedDropZoneFiles, setSelectedDropZoneFiles] = useState<Set<number>>(new Set());
    const [uploadHistory, setUploadHistory] = useState<UploadHistoryEntry[]>(() => {
        const savedHistory = localStorage.getItem('uploadHistory');
        return savedHistory ? JSON.parse(savedHistory) : [];
    });
    const [isRBImport, setIsRBImport] = useState(false);
    const [rowsToShow, setRowsToShow] = useState(20);
    const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('uploadHistory', JSON.stringify(uploadHistory));
    }, [uploadHistory]);

    if (!server) {
        return null;
    }
    if (server.fbToken === undefined) {
        throw new Error('FB Server is not authenticated');
    }

    const handleDrop = (acceptedFiles: File[]) => {
        setFiles([...files, ...acceptedFiles]);
    };

    const updateUploadStatus = (
        id: string,
        status: string,
        uploadProgress: number,
        processProgress: number,
    ) => {
        const currentTime = new Date().toISOString();
        setUploadHistory((prevHistory) => {
            const newHistory = prevHistory.map((entry) =>
                entry.id === id
                    ? {
                          ...entry,
                          processProgress,
                          status,
                          updatedTime: currentTime,
                          uploadProgress,
                      }
                    : entry,
            );
            return newHistory;
        });
    };

    const handleUpload = async () => {
        if (server.fbToken === undefined) {
            throw new Error('FB Server is not authenticated');
        }
        // Check for Rekordbox files
        const isRekordboxImport = files.some(
            (file) =>
                file.name === 'rekordbox-backup.xml' ||
                file.name === 'rekordbox_bak.zip' ||
                file.name === 'rekordbox_bak',
        );
        if (isRekordboxImport && !isRBImport) {
            setIsModalOpen(true);
            return;
        }
        const currentTime = new Date().toISOString();
        const newUploadHistory = files.map((file) => ({
            createdTime: currentTime,
            fileName: file.name,
            id: uuidv4(),
            processProgress: 0,
            status: 'Pending',
            updatedTime: currentTime,
            uploadProgress: 0,
        }));
        setUploadHistory([...uploadHistory, ...newUploadHistory]);
        try {
            await upload(
                newUploadHistory.map(({ id, fileName }) => ({
                    file: files.find((f) => f.name === fileName)!,
                    id,
                })),
                isRBImport,
                server.fbToken,
                updateUploadStatus,
            );
            console.log('upload history', uploadHistory);
            await processImport(false, isRBImport, false, updateUploadStatus);
        } catch (error) {
            console.error('Error uploading files:', error);
        }
        setFiles([]); // Clear the files after upload
        setSelectedDropZoneFiles(new Set()); // Clear selected files after upload
    };

    const handleDropZoneFileSelect = (index: number) => {
        setSelectedDropZoneFiles((prevSelectedFiles) => {
            const newSelectedFiles = new Set(prevSelectedFiles);
            if (newSelectedFiles.has(index)) {
                newSelectedFiles.delete(index);
            } else {
                newSelectedFiles.add(index);
            }
            return newSelectedFiles;
        });
    };

    const handleRemoveSelectedDropZoneFiles = () => {
        setFiles((prevFiles) => prevFiles.filter((_, index) => !selectedDropZoneFiles.has(index)));
        setSelectedDropZoneFiles(new Set());
    };

    const formatTime = (time: string) => {
        return new Date(time).toLocaleString('en-US', { hour12: false, timeStyle: 'medium' });
    };
    const handleImageClick = (imageSrc: string) => {
        setSelectedImage(imageSrc);
        setIsImageModalOpen(true);
    };

    const handleReprocessFailedFiles = async () => {
        await processImport(false, isRBImport, false, updateUploadStatus);
    };

    return (
        <Box
            m={2}
            p={20}
        >
            <Text
                align="center"
                mb={10}
                size="sm"
            >
                Upload music files to subbox.
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
            <Text
                align="center"
                mb={10}
                size="sm"
            >
                To import your collection from DJ software follow the steps below.
            </Text>
            <Box mt={2}>
                {files.length > 0 && (
                    <Box>
                        <Text>Files to be uploaded:</Text>
                        <ul>
                            {files.map((file, index) => (
                                <li
                                    key={index}
                                    style={{ alignItems: 'center', display: 'flex' }}
                                >
                                    <Checkbox
                                        checked={selectedDropZoneFiles.has(index)}
                                        style={{
                                            borderRadius: '50%',
                                            marginRight: '10px',
                                        }}
                                        onChange={() => handleDropZoneFileSelect(index)}
                                    />
                                    {file.name}
                                </li>
                            ))}
                        </ul>
                        <Button
                            mt="md"
                            onClick={handleRemoveSelectedDropZoneFiles}
                        >
                            Remove Selected
                        </Button>
                        <Checkbox
                            checked={isRBImport}
                            label="Rekordbox import"
                            mt="md"
                            onChange={(event) => setIsRBImport(event.currentTarget.checked)}
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
            {uploadHistory.length > 0 && (
                <Box mt={2}>
                    <Text>Upload History:</Text>

                    <Box style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <Table>
                            <thead>
                                <tr>
                                    <th>File Name</th>
                                    <th>Upload</th>
                                    <th>Process</th>
                                    <th>Status</th>
                                    <th>Created Time</th>
                                    <th>Updated Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {uploadHistory
                                    .sort(
                                        (a, b) =>
                                            new Date(a.createdTime).getTime() -
                                            new Date(b.createdTime).getTime(),
                                    )
                                    .slice(0, rowsToShow)
                                    .map((entry) => (
                                        <tr key={entry.id}>
                                            <td>{entry.fileName}</td>
                                            <td>
                                                <Progress value={entry.uploadProgress || 0} />
                                            </td>
                                            <td>
                                                <Progress value={entry.processProgress || 0} />
                                            </td>
                                            <td>{entry.status || 'Pending'}</td>
                                            <td>{formatTime(entry.createdTime)}</td>
                                            <td>{formatTime(entry.updatedTime)}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </Table>
                    </Box>
                    <Box
                        mt="md"
                        style={{ display: 'flex', justifyContent: 'flex-start' }}
                    >
                        <Select
                            data={['10', '20', '30', '40', '50']}
                            label="Rows to show"
                            size="xs"
                            value={rowsToShow.toString()}
                            onChange={(value) => setRowsToShow(Number(value))}
                        />
                    </Box>
                    <Group
                        mt="md"
                        position="center"
                    >
                        <Button onClick={handleReprocessFailedFiles}>Re-process Failed</Button>
                    </Group>
                </Box>
            )}
            <Divider my="lg" />
            <Box mt={2}>
                <Text
                    align="center"
                    mb={20}
                    size="md"
                >
                    Import from DJ Software
                </Text>
                <Group position="center">
                    <Button
                        variant="outline"
                        onClick={() => setIsInstructionsOpen((prev) => !prev)}
                    >
                        Import from Rekordbox
                    </Button>
                </Group>
                <Collapse in={isInstructionsOpen}>
                    <Box
                        mt={20}
                        style={{ maxHeight: '400px' }}
                    >
                        <List
                            center
                            withPadding
                            size="sm"
                        >
                            <List.Item>
                                Export your RB collection (From rekordbox desktop app:
                                File-&gt;Library-&gt;Backup Library).
                                <List
                                    center
                                    withPadding
                                    size="sm"
                                >
                                    <List.Item mb={20}>
                                        Make sure you select &apos;yes&apos; to backing up music
                                        files as well. This will create a &apos;rekordbox_bak&apos;
                                        folder with the music files in. It will also create a zip
                                        folder but this is not needed.
                                    </List.Item>
                                </List>
                                <Image
                                    alt="RekordBox Backup"
                                    mb={20}
                                    src={RBBackup}
                                    style={{ cursor: 'pointer' }}
                                    width={200}
                                    onClick={() => handleImageClick(RBBackup)}
                                />
                            </List.Item>

                            <List.Item>
                                To decrease the time it takes to import your collection to subbox,
                                create a zip of the &apos;rekordbox_bak&apos; directory made in the
                                above step. Call it &apos;rekordbox_bak.zip&apos;.
                            </List.Item>
                            <List.Item>
                                Backup your collection as xml (File -&gt; Export Collection in xml
                                format).
                                <List
                                    center
                                    withPadding
                                    size="sm"
                                >
                                    <List.Item mb={20}>
                                        Save it as &apos;rekordbox-backup.xml&apos;. This contains
                                        all the playlist data needed to create your playlists in
                                        subbox.
                                    </List.Item>
                                </List>
                            </List.Item>
                            <List.Item>
                                Once the above has been completed in rekordbox, upload the resulting
                                xml and rekordbox_bak directory zip to subbox in the above box and
                                tick the &apos;Rekordbox import&apos; check box.
                            </List.Item>
                        </List>
                    </Box>
                </Collapse>
            </Box>
            <Modal
                opened={isImageModalOpen}
                size="auto"
                onClose={() => setIsImageModalOpen(false)}
            >
                <Image
                    alt="Full Screen Image"
                    src={selectedImage}
                />
            </Modal>
            <Modal
                centered
                opened={isModalOpen}
                size="auto"
                onClose={() => setIsModalOpen(false)}
            >
                <Text>
                    Seems like you are attempting to upload a Rekordbox export. If so, please check
                    the Rekordbox import check box.
                </Text>
            </Modal>
        </Box>
    );
};
