import { useCurrentServer } from '/@/renderer/store';
import { ServerListItem } from '/@/renderer/types';
import { useState } from 'react';
import { Box, Button, Text, Modal, Group, Collapse, Image, List } from '@mantine/core'; // Assuming you are using Mantine UI
import isElectron from 'is-electron';
import { toast } from '/@/renderer/components';
import { useTranslation } from 'react-i18next';
import { pymixController } from '/@/renderer/api/pymix/pymix-controller';
import RBImportEnable from '../../../../../assets/RB-import-enable-xml.png';
import RBImportSetPath from '../../../../../assets/RB-import-set-xml-path.png';

const userFS = isElectron() ? window.electron.userFs : null;
const util = isElectron() ? window.electron.utils : null;

async function syncMusicDirectory(directoryPath: string, server: ServerListItem) {
    if (userFS) {
        if (server.fbToken === undefined) {
            // todo route to action-required
            throw new Error('FB Server is not authenticated');
        }
        try {
            await userFS.sync(directoryPath, server.username, server.fbToken);
        } catch (error) {
            console.error('Error syncing music directory:', error);
        }
    }
}

export const DownloadContent = () => {
    const server = useCurrentServer();
    const { t } = useTranslation();
    const [isSyncing, setIsSyncing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (!server || !userFS) {
        return null;
    }

    const handleRBDownload = async () => {
        setIsSyncing(true);

        // todo user can enter their local path so pymix prepares the download and stores on filebrowser
        // then the user can download directly from filebrowser for webapp support.
        const appPath = await userFS.getAppPath();
        try {
            await pymixController.rbDownload({
                body: { user_root: appPath },
            });
        } catch (error) {
            toast.error({
                message: (error as Error).message,
                title: t('error.syncError', {
                    postProcess: 'sentenceCase',
                }),
            });
            console.error('Error downloading rekordbox info:', error);
        } finally {
            setIsSyncing(false);
            setIsModalOpen(true);
        }

        if (userFS) {
            if (server.fbToken === undefined) {
                throw new Error('FB Server is not authenticated');
            }
            await userFS.downloadRBXML(server.fbToken);
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        const appPath = await userFS.getAppPath();
        const musicPath = `${appPath}/music`;
        console.log('start syncing', musicPath);
        return syncMusicDirectory(musicPath, server)
            .catch((error) => {
                toast.error({
                    message: (error as Error).message,
                    title: t('error.syncError', {
                        postProcess: 'sentenceCase',
                    }),
                });
                console.error('Error syncing music directory:', error);
            })
            .finally(() => {
                setIsSyncing(false);
                setIsModalOpen(true);
            });
    };

    const handleImageClick = (imageSrc: string) => {
        setSelectedImage(imageSrc);
        setIsImageModalOpen(true);
    };

    return (
        <Box
            m={2}
            p={20}
        >
            <Text
                align="center"
                mb={20}
                size="md"
            >
                Download any tracks on subbox that are missing on your local machine. This will sync
                the music you have uploaded to subbox to your local file system.
            </Text>
            <Group
                mb={20}
                position="center"
            >
                <Button
                    color={isSyncing ? 'gray' : 'blue'}
                    disabled={isSyncing}
                    onClick={handleSync}
                >
                    {isSyncing ? 'Downloading...' : 'Download'}
                </Button>
            </Group>
            <Modal
                opened={isModalOpen}
                title="Download Complete"
                onClose={() => setIsModalOpen(false)}
            >
                <Text>
                    Download complete.{' '}
                    <Button
                        variant="link"
                        onClick={async () => {
                            if (util) {
                                const appPath = await userFS.getAppPath();
                                const exportZipPath = `${appPath}/subbox-export.zip`;
                                util.openItem(exportZipPath).catch((error) => {
                                    toast.error({
                                        message: (error as Error).message,
                                        title: t('error.openError', {
                                            postProcess: 'sentenceCase',
                                        }),
                                    });
                                });
                            }
                        }}
                    >
                        Click here to go to your download!
                    </Button>
                </Text>
            </Modal>

            <Text
                align="center"
                mb={20}
                size="md"
            >
                The Rekordbox Info button prepares and downloads the rekordbox.xml file to your
                local system, which contains your playlist info for Rekordbox to understand.
            </Text>
            <Group position="center">
                <Button
                    color={isSyncing ? 'gray' : 'blue'}
                    disabled={isSyncing}
                    onClick={handleRBDownload}
                >
                    {isSyncing ? 'Downloading...' : 'Download Rekordbox Info'}
                </Button>
            </Group>
            <Modal
                opened={isModalOpen}
                title="Download Complete"
                onClose={() => setIsModalOpen(false)}
            >
                <Text>
                    Download complete.{' '}
                    <Button
                        variant="link"
                        onClick={async () => {
                            if (util) {
                                const appPath = await userFS.getAppPath();
                                util.openItem(appPath).catch((error) => {
                                    toast.error({
                                        message: (error as Error).message,
                                        title: t('error.openError', {
                                            postProcess: 'sentenceCase',
                                        }),
                                    });
                                });
                            }
                        }}
                    >
                        Click here to go to your download!
                    </Button>
                </Text>
            </Modal>

            <Group
                mt={20}
                position="center"
            >
                <Button
                    variant="outline"
                    onClick={() => setIsInstructionsOpen((prev) => !prev)}
                >
                    How to import XML into RekordBox
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
                        <List.Item mb={20}>
                            In Rekordbox, go to Preferences -&gt; View -&gt; check &apos;rekordbox
                            xml&apos; in Layout.
                        </List.Item>
                        <Image
                            alt="Enable RekordBox XML"
                            mb={20}
                            src={RBImportEnable}
                            style={{ cursor: 'pointer' }}
                            width={200}
                            onClick={() => handleImageClick(RBImportEnable)}
                        />
                        <List.Item mb={20}>
                            Then set the path of the XML in Preferences -&gt; Advanced -&gt;
                            Database tab -&gt; Imported Library. This must match the path of the XML
                            you downloaded from subbox on your local system.
                        </List.Item>
                        <Image
                            alt="Set RekordBox XML Path"
                            mb={20}
                            src={RBImportSetPath}
                            style={{ cursor: 'pointer' }}
                            width={200}
                            onClick={() => handleImageClick(RBImportSetPath)}
                        />
                        <List.Item>
                            You should now see an XML option in the left sidebar. Click this and
                            import the tracks and playlists into your collection.
                        </List.Item>
                    </List>
                </Box>
            </Collapse>

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
        </Box>
    );
};
