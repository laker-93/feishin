import { Box, Text, Button, Group, Image, Divider, List, Modal } from '@mantine/core';
import { openContextModal } from '@mantine/modals';
import { useTranslation } from 'react-i18next';
import { RiAccountBoxLine, RiLoginBoxLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { useCurrentServer } from '/@/renderer/store';
import { CreateAccountForm } from '/@/renderer/features/servers/components/create-account-form';
import { AddServerForm } from '/@/renderer/features/servers';
import { useState } from 'react';
import discordimg from '../../../../../assets/discordimg.png';

type ModalVars = {
    context: {
        closeModal: (id: string) => void;
    };
    id: string;
};

const CreateAccountModalBody = ({ vars }: { vars: ModalVars }) => (
    <CreateAccountForm onCancel={() => vars.context.closeModal(vars.id)} />
);

const LogOnModalBody = ({ vars }: { vars: ModalVars }) => (
    <AddServerForm onCancel={() => vars.context.closeModal(vars.id)} />
);

export const AboutContent = () => {
    const { t } = useTranslation();
    const currentServer = useCurrentServer();
    const isLoggedOn = currentServer && currentServer.credential;
    const [isGettingStartedModalOpen, setIsGettingStartedModalOpen] = useState(false);

    const handleCreateAccountModal = () => {
        openContextModal({
            innerProps: {
                modalBody: CreateAccountModalBody,
            },
            modal: 'base',
            title: t('form.createAccount.title', { postProcess: 'titleCase' }),
        });
    };

    const handleLogOnModal = () => {
        openContextModal({
            innerProps: {
                modalBody: LogOnModalBody,
            },
            modal: 'base',
            title: t('form.logon.title', { postProcess: 'titleCase' }),
        });
    };

    const handleImageClick = () => {
        window.open('https://discord.gg/mqrRbex3hs', '_blank');
    };

    return (
        <Box
            m={2}
            p={20}
        >
            <Text
                align="center"
                mb={20}
                size="xl"
                weight={700}
            >
                Sub-box is a music player with tools for DJs.
            </Text>
            <List size="md">
                <List.Item>
                    <Link to="/upload">Upload</Link> your audio files and then stream and organise
                    your collection on the go from mobile, desktop or the browser.
                </List.Item>
                <List.Item>
                    Use in built features, such as completing missing meta information like alburm
                    artwork and detecting duplicate tracks, to keep your collection organised
                </List.Item>
                <List.Item>
                    <Link to="/download">Export</Link> your collection from subbox to your local
                    machine, ready to be imported in to DJ software.
                </List.Item>
            </List>

            <Divider my={20} />
            {isLoggedOn ? (
                <div>
                    <Text
                        align="center"
                        mb={20}
                        size="xl"
                        weight={700}
                    >
                        Getting Started
                    </Text>
                    <Group
                        mt={20}
                        position="center"
                    >
                        <Button onClick={() => setIsGettingStartedModalOpen(true)}>
                            View Getting Started Guide
                        </Button>
                    </Group>
                    <Modal
                        opened={isGettingStartedModalOpen}
                        title="Getting Started"
                        onClose={() => setIsGettingStartedModalOpen(false)}
                    >
                        <Text
                            align="center"
                            mb={10}
                            size="md"
                        >
                            For an overview of how to use subbox, watch the video below.
                        </Text>
                        {/* Add video or additional content here */}
                    </Modal>
                </div>
            ) : (
                <>
                    <Text
                        align="center"
                        mb={20}
                        size="md"
                    >
                        To upload your own music collection and use the DJ tools, you will need to
                        create an account.
                    </Text>
                    <Group
                        mb={20}
                        position="center"
                    >
                        <Button
                            size="md"
                            variant="default"
                            onClick={handleCreateAccountModal}
                        >
                            <RiAccountBoxLine size="1.5rem" />
                            <Text ml={10}>Create Account</Text>
                        </Button>
                    </Group>
                    <Text
                        align="center"
                        mb={20}
                        size="md"
                    >
                        or if you already have an account, login
                    </Text>
                    <Group position="center">
                        <Button
                            size="md"
                            variant="default"
                            onClick={handleLogOnModal}
                        >
                            <RiLoginBoxLine size="1.5rem" />
                            <Text ml={10}>Login</Text>
                        </Button>
                    </Group>
                </>
            )}

            <Divider my={20} />
            <Text
                align="center"
                mb={20}
                size="xl"
                weight={700}
            >
                Community & Desktop App
            </Text>
            <Group
                mt={20}
                position="center"
            >
                <Text
                    align="center"
                    mb={10}
                    size="md"
                >
                    Join our Discord channel to connect with other users, give feedback and stay up
                    to date with the latest features. You can also apply for beta trials of the
                    Desktop App on the Discord channel.
                </Text>
            </Group>
            <Group
                mt={10}
                position="center"
            >
                <Image
                    alt="Discord Invite"
                    src={discordimg}
                    style={{
                        borderRadius: '100%',
                        cursor: 'pointer',
                        height: '50px',
                        width: '50px',
                    }}
                    onClick={handleImageClick}
                />
            </Group>
            <Divider my={20} />
            <Text
                mb={20}
                size="s"
            >
                Subbox is inspired by <Link to="https://github.com/jeffvli/feishin">Feishin</Link>{' '}
                and built on top of{' '}
                <Link to="https://github.com/navidrome/navidrome">Navidrome</Link> and{' '}
                <Link to="https://github.com/beetbox/beets">Beets</Link>.
            </Text>
        </Box>
    );
};
