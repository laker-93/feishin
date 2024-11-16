import { useCurrentServer } from '/@/renderer/store';
import { ServerListItem } from '/@/renderer/types';
import { useState } from 'react';
import { Box, Button, Text, Modal } from '@mantine/core'; // Assuming you are using Mantine UI
import isElectron from 'is-electron';
import { toast } from '/@/renderer/components';
import { useTranslation } from 'react-i18next';
import { pymixController } from '/@/renderer/api/pymix/pymix-controller';

const userFS = isElectron() ? window.electron.userFs : null;
const util = isElectron() ? window.electron.utils : null;

async function syncMusicDirectory(directoryPath: string, server: ServerListItem) {
    if (userFS) {
        if (server.fbToken === undefined) {
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

    if (!server || !userFS) {
        return null;
    }
    const handleRBDownload = async () => {
        setIsSyncing(true);

        // todo user can enter their local path so pymix prepares the download and stores on filebrowser
        // then the user can download directly from filebrowser for webapp support.
        const appPath = await userFS.getAppPath();
        pymixController
            .rbDownload({
                body: { user_root: appPath },
            })
            .catch((error) => {
                toast.error({
                    message: (error as Error).message,
                    title: t('error.syncError', {
                        postProcess: 'sentenceCase',
                    }),
                });
                console.error('Error downloading rekordbox info:', error);
            })
            .finally(() => {
                setIsSyncing(false);
                setIsModalOpen(true);
            });
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

    return (
        <Box
            m={2}
            p={20}
        >
            <Text>Download rekordbox xml. </Text>
            <Button
                color={isSyncing ? 'gray' : 'blue'}
                disabled={isSyncing}
                onClick={handleRBDownload}
            >
                {isSyncing ? 'Downloading...' : 'Download rekordbox info'}
            </Button>
            <Modal
                opened={isModalOpen}
                title="Download Complete"
                onClose={() => setIsModalOpen(false)}
            >
                <Text>
                    download complete.{' '}
                    <Button
                        variant="link"
                        onClick={async () => {
                            if (util) {
                                const appPath = await userFS.getAppPath();
                                const rbXmlPath = `${appPath}/rb-export.xml`;
                                util.openItem(rbXmlPath).catch((error) => {
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

            <Text>Download any tracks on subbox that are missing on your local machine.</Text>
            <Button
                color={isSyncing ? 'gray' : 'blue'}
                disabled={isSyncing}
                onClick={handleSync}
            >
                {isSyncing ? 'Downloading...' : 'Download'}
            </Button>
            <Modal
                opened={isModalOpen}
                title="Download Complete"
                onClose={() => setIsModalOpen(false)}
            >
                <Text>
                    download complete.{' '}
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
        </Box>
    );
};
