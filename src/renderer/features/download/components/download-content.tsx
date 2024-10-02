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

    if (!server) {
        return null;
    }
    const handleRBDownload = () => {
        setIsSyncing(true);
        return pymixController
            .rbDownload({
                body: { user_root: '/Users/lukepurnell/Library/Application Support/subbox' },
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
    };

    const handleSync = () => {
        setIsSyncing(true);
        console.log('start syncing');
        return syncMusicDirectory(
            '/Users/lukepurnell/Library/Application Support/subbox/music',
            server,
        )
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
            <Text>Download rekordbox. </Text>
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
                        onClick={() => {
                            if (util) {
                                util.openItem(
                                    '/Users/lukepurnell/Library/Application Support/subbox/rb-export.xml',
                                ).catch((error) => {
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

            <Text>Download. </Text>
            <Button
                color={isSyncing ? 'gray' : 'blue'}
                disabled={isSyncing}
                onClick={handleSync}
            >
                {isSyncing ? 'Syncing...' : 'Sync Music Directory'}
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
                        onClick={() => {
                            if (util) {
                                util.openItem(
                                    '/Users/lukepurnell/Library/Application Support/subbox/subbox-export.zip',
                                ).catch((error) => {
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
