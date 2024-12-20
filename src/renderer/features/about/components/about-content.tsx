import { Box, Text, Button, Group, Image, Divider } from '@mantine/core';
import { openContextModal } from '@mantine/modals';
import { useTranslation } from 'react-i18next';
import { RiAccountBoxLine, RiLoginBoxLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { useCurrentServer } from '/@/renderer/store';
import { CreateAccountForm } from '/@/renderer/features/servers/components/create-account-form';
import { AddServerForm } from '/@/renderer/features/servers';
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

    const handleCreateAccountModal = () => {
        openContextModal({
            innerProps: {
                modalBody: CreateAccountModalBody,
            },
            modal: 'base',
            title: t('form.logon.title', { postProcess: 'titleCase' }),
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
            {isLoggedOn ? (
                <div>
                    <Text
                        align="center"
                        size="md"
                    >
                        You can upload tracks <Link to="/upload">here</Link>.
                    </Text>
                    <Text
                        align="center"
                        size="md"
                    >
                        You can download your collection ready to import in to your DJ software{' '}
                        <Link to="/download">here</Link>.
                    </Text>
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
                Community
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
                    Join our Discord channel to connect with other users, get help, give feedback
                    and stay up to date with the latest features.
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
        </Box>
    );
};
